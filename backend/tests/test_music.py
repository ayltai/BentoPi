import asyncio
import unittest
from pathlib import Path
from threading import Event, Thread
from unittest.mock import MagicMock, call, patch

import httpx
from fastapi import FastAPI
from pygame import error as MixerError
from pygame import mixer
from starlette.types import Message, Receive, Scope, Send

from src.media.audio_controller import AudioController
from src.routers.music import router

ALARM_FILE = Path(__file__).resolve().parents[1] / 'assets' / 'alarm-beep.wav'


class AudioControllerTests(unittest.TestCase):
    @patch.object(mixer, 'music')
    def test_play_defaults_to_looping(self, music: MagicMock) -> None:
        AudioController.play(str(ALARM_FILE))

        music.stop.assert_called_once_with()
        music.unload.assert_called_once_with()
        music.load.assert_called_once_with(str(ALARM_FILE))
        music.play.assert_called_once_with(loops=-1)

    @patch.object(mixer, 'music')
    def test_play_failure_propagates(self, music: MagicMock) -> None:
        music.play.side_effect = MixerError('speaker unavailable')

        with self.assertRaisesRegex(MixerError, 'speaker unavailable'):
            AudioController.play(str(ALARM_FILE), loop=False)

        music.play.assert_called_once_with(loops=0)

    @patch.object(mixer, 'music')
    def test_stop_waits_for_inflight_play(self, music: MagicMock) -> None:
        load_started = Event()
        release_load = Event()
        stop_started = Event()
        stop_finished = Event()
        failures: list[Exception] = []

        def block_load(_file_path: str) -> None:
            load_started.set()
            if not release_load.wait(timeout=5):
                raise TimeoutError('playback load was not released')

        def play() -> None:
            try:
                AudioController.play(str(ALARM_FILE), loop=False)
            except Exception as error:
                failures.append(error)

        def stop() -> None:
            stop_started.set()
            try:
                AudioController.stop()
            except Exception as error:
                failures.append(error)
            finally:
                stop_finished.set()

        music.load.side_effect = block_load
        play_thread = Thread(target=play, daemon=True)
        stop_thread = Thread(target=stop, daemon=True)
        play_thread.start()
        try:
            self.assertTrue(load_started.wait(timeout=2))
            stop_thread.start()
            self.assertTrue(stop_started.wait(timeout=2))
            self.assertFalse(stop_finished.wait(timeout=0.25), 'stop finished before playback started')
        finally:
            release_load.set()
            play_thread.join(timeout=2)
            if stop_thread.ident is not None:
                stop_thread.join(timeout=2)

        self.assertFalse(play_thread.is_alive())
        self.assertFalse(stop_thread.is_alive())
        self.assertEqual(failures, [])
        self.assertEqual(
            music.mock_calls,
            [
                call.stop(),
                call.unload(),
                call.load(str(ALARM_FILE)),
                call.play(loops=0),
                call.stop(),
                call.unload(),
            ],
        )


class MusicRouteTests(unittest.IsolatedAsyncioTestCase):
    app: FastAPI
    client: httpx.AsyncClient
    music: MagicMock

    async def asyncSetUp(self) -> None:
        self.app = FastAPI()
        self.app.include_router(router)
        self.client = httpx.AsyncClient(
            transport=httpx.ASGITransport(app=self.app, raise_app_exceptions=False),
            base_url='http://testserver',
        )
        self.addAsyncCleanup(self.client.aclose)

        patcher = patch.object(mixer, 'music')
        self.music = patcher.start()
        self.addCleanup(patcher.stop)

    async def test_default_and_explicit_true_loop(self) -> None:
        for params in (None, {'loop': 'true'}):
            with self.subTest(params=params):
                self.music.reset_mock()
                response = await self.client.get('/api/v1/music/play/alarm-beep', params=params)

                self.assertEqual(response.status_code, 200)
                self.assertIsNone(response.json())
                self.music.stop.assert_called_once_with()
                self.music.unload.assert_called_once_with()
                self.assertEqual(Path(self.music.load.call_args.args[0]).resolve(), ALARM_FILE)
                self.music.play.assert_called_once_with(loops=-1)

    async def test_false_plays_once(self) -> None:
        response = await self.client.get('/api/v1/music/play/alarm-beep', params={'loop': 'false'})

        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.json())
        self.music.play.assert_called_once_with(loops=0)

    async def test_invalid_loop_is_rejected(self) -> None:
        response = await self.client.get('/api/v1/music/play/alarm-beep', params={'loop': 'not-a-bool'})

        self.assertEqual(response.status_code, 422)
        self.music.stop.assert_not_called()
        self.music.load.assert_not_called()
        self.music.play.assert_not_called()

    async def test_missing_track_returns_404(self) -> None:
        track_name = 'unittest-missing-track-0a9813c5'
        response = await self.client.get(f'/api/v1/music/play/{track_name}')

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {'detail': f'Track not found: {track_name}'})
        self.music.load.assert_not_called()
        self.music.play.assert_not_called()

    async def test_mixer_failures_return_500(self) -> None:
        for operation in ('stop', 'unload', 'load', 'play'):
            with self.subTest(operation=operation):
                mocked_operation = getattr(self.music, operation)
                mocked_operation.side_effect = MixerError('simulated mixer failure')
                try:
                    response = await self.client.get(
                        '/api/v1/music/play/alarm-beep', params={'loop': 'false'}
                    )
                    self.assertEqual(response.status_code, 500)
                finally:
                    mocked_operation.side_effect = None
                    self.music.reset_mock()

    async def test_stop_contract_is_unchanged(self) -> None:
        response = await self.client.get('/api/v1/music/stop')

        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.json())
        self.music.stop.assert_called_once_with()
        self.music.unload.assert_called_once_with()

    async def test_stop_failure_returns_500(self) -> None:
        self.music.unload.side_effect = MixerError('cannot unload')

        response = await self.client.get('/api/v1/music/stop')

        self.assertEqual(response.status_code, 500)

    async def test_stop_finishes_before_response_and_subsequent_play(self) -> None:
        started = Event()
        release = Event()
        finished = Event()
        response_started = asyncio.Event()
        finished_when_response_started: list[bool] = []

        @self.app.get('/probe')
        async def probe() -> dict[str, bool]:
            return {'ok': True}

        def blocking_unload() -> None:
            started.set()
            release.wait(timeout=5)
            finished.set()

        async def observed_app(scope: Scope, receive: Receive, send: Send) -> None:
            async def observed_send(message: Message) -> None:
                if message['type'] == 'http.response.start':
                    finished_when_response_started.append(finished.is_set())
                    response_started.set()
                await send(message)

            await self.app(scope, receive, observed_send)

        self.music.unload.side_effect = blocking_unload
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=observed_app, raise_app_exceptions=False),
            base_url='http://testserver',
        ) as client:
            task = asyncio.create_task(client.get('/api/v1/music/stop'))
            try:
                self.assertTrue(await asyncio.to_thread(started.wait, 2))
                self.assertFalse(response_started.is_set())
                self.assertFalse(task.done())
                probe_response = await asyncio.wait_for(self.client.get('/probe'), timeout=2)
                self.assertEqual(probe_response.status_code, 200)
            finally:
                release.set()
                stop_response = await asyncio.wait_for(task, timeout=5)

        self.assertEqual(stop_response.status_code, 200)
        self.assertEqual(finished_when_response_started, [True])

        play_response = await self.client.get('/api/v1/music/play/alarm-beep', params={'loop': 'false'})
        self.assertEqual(play_response.status_code, 200)
        self.music.play.assert_called_once_with(loops=0)
        self.assertEqual(
            [call[0] for call in self.music.mock_calls],
            ['stop', 'unload', 'stop', 'unload', 'load', 'play'],
        )

    async def test_playback_does_not_block_the_event_loop(self) -> None:
        started = Event()
        release = Event()

        @self.app.get('/probe')
        async def probe() -> dict[str, bool]:
            return {'ok': True}

        def blocking_play(_file_path: str, _loop: bool) -> None:
            started.set()
            release.wait(timeout=5)

        with patch.object(AudioController, 'play', side_effect=blocking_play) as play:
            task = asyncio.create_task(
                self.client.get('/api/v1/music/play/alarm-beep', params={'loop': 'false'})
            )
            try:
                self.assertTrue(await asyncio.to_thread(started.wait, 2))
                self.assertFalse(task.done())
                response = await asyncio.wait_for(self.client.get('/probe'), timeout=2)
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json(), {'ok': True})
                self.assertFalse(task.done())
            finally:
                release.set()
                play_response = await asyncio.wait_for(task, timeout=5)

            self.assertEqual(play_response.status_code, 200)
            play.assert_called_once()
            self.assertIs(play.call_args.args[1], False)


if __name__ == '__main__':
    unittest.main()
