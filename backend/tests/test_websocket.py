import asyncio
import json
import unittest
from unittest.mock import MagicMock, Mock, patch

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from starlette.types import Message, Scope

from src.routers import websocket as websocket_router
from src.services.device_manager import DeviceManager


class InMemoryWebSocket:
    def __init__(self, app: FastAPI, device_id: str) -> None:
        self.app: FastAPI = app
        self.device_id: str = device_id
        self.incoming: asyncio.Queue[Message] = asyncio.Queue()
        self.outgoing: asyncio.Queue[Message] = asyncio.Queue()
        self.task: asyncio.Task[None] | None = None
        self.fail_next_send: bool = False
        self.send_started: asyncio.Event = asyncio.Event()
        self.release_send: asyncio.Event = asyncio.Event()

    async def server_send(self, message: Message) -> None:
        if self.fail_next_send and message['type'] == 'websocket.send':
            self.fail_next_send = False
            self.send_started.set()
            await self.release_send.wait()
            raise OSError('simulated closed connection')

        await self.outgoing.put(message)

    async def open(self) -> None:
        path = f'/ws/{self.device_id}'
        scope: Scope = {
            'type': 'websocket',
            'asgi': {'version': '3.0', 'spec_version': '2.3'},
            'path': path,
            'raw_path': path.encode(),
            'root_path': '',
            'scheme': 'ws',
            'query_string': b'',
            'headers': [],
            'client': ('testclient', 12345),
            'server': ('testserver', 80),
            'subprotocols': [],
        }
        self.task = asyncio.create_task(self.app(scope, self.incoming.get, self.server_send))
        await self.incoming.put({'type': 'websocket.connect'})
        response = await asyncio.wait_for(self.outgoing.get(), timeout=2)
        if response['type'] != 'websocket.accept':
            raise AssertionError(f'Unexpected handshake response: {response}')

    async def send_json(self, payload: dict[str, object]) -> None:
        await self.incoming.put({'type': 'websocket.receive', 'text': json.dumps(payload)})

    async def receive_json(self) -> dict[str, object]:
        message = await asyncio.wait_for(self.outgoing.get(), timeout=2)
        if message['type'] != 'websocket.send':
            raise AssertionError(f'Unexpected WebSocket message: {message}')
        return json.loads(message['text'])

    async def close(self) -> None:
        if self.task is None:
            return
        if not self.task.done():
            await self.incoming.put({'type': 'websocket.disconnect', 'code': 1000})
        await asyncio.wait_for(self.task, timeout=2)


class WebSocketRouteTests(unittest.IsolatedAsyncioTestCase):
    app: FastAPI
    manager: DeviceManager

    async def asyncSetUp(self) -> None:
        self.manager = DeviceManager()
        patcher = patch.object(websocket_router, 'device_manager', self.manager)
        patcher.start()
        self.addCleanup(patcher.stop)

        self.app = FastAPI()
        self.app.include_router(websocket_router.router)

    async def open_websocket(self, device_id: str) -> InMemoryWebSocket:
        client = InMemoryWebSocket(self.app, device_id)
        self.addAsyncCleanup(client.close)
        await client.open()
        return client

    async def test_replacement_survives_old_disconnect_and_relays_messages(self) -> None:
        older = await self.open_websocket('timer')
        older_connection = self.manager.devices['timer']
        current = await self.open_websocket('timer')
        current_connection = self.manager.devices['timer']
        self.assertIsNot(older_connection, current_connection)

        await older.close()
        self.assertIs(self.manager.devices.get('timer'), current_connection)

        sender = await self.open_websocket('client-123')
        message = {'content': 'hello'}
        await sender.send_json({'target_id': 'timer', 'payload': message})
        self.assertEqual(await current.receive_json(), message)

        response = {'content': 'world'}
        await current.send_json({'target_id': 'client-123', 'payload': response})
        self.assertEqual(await sender.receive_json(), response)

    async def test_normal_disconnect_removes_only_current_device(self) -> None:
        timer = await self.open_websocket('timer')
        await self.open_websocket('other')

        await timer.close()

        self.assertNotIn('timer', self.manager.devices)
        self.assertIn('other', self.manager.devices)
        self.assertFalse(await self.manager.send('timer', {'requestId': 'missing'}))

    async def test_stale_failed_send_preserves_replacement(self) -> None:
        older = await self.open_websocket('timer')
        sender = await self.open_websocket('client-123')
        probe = await self.open_websocket('probe')
        older.fail_next_send = True
        await sender.send_json({'target_id': 'timer', 'payload': {'requestId': 'old'}})

        try:
            await asyncio.wait_for(older.send_started.wait(), timeout=2)
            current = await self.open_websocket('timer')
            current_connection = self.manager.devices['timer']
        finally:
            older.release_send.set()

        # A later message on the same sender proves the failed send has finished.
        await sender.send_json({'target_id': 'probe', 'payload': {'ready': True}})
        self.assertEqual(await probe.receive_json(), {'ready': True})
        self.assertIs(self.manager.devices.get('timer'), current_connection)

        task = {'title': 'Next', 'timeLimit': 2}
        await sender.send_json({'target_id': 'timer', 'payload': task})
        self.assertEqual(await current.receive_json(), task)


class DeviceManagerTests(unittest.IsolatedAsyncioTestCase):
    def test_disconnect_checks_identity_not_equality(self) -> None:
        manager = DeviceManager()
        older = MagicMock(spec=WebSocket)
        current = MagicMock(spec=WebSocket)
        current.__eq__.return_value = True
        self.assertEqual(current, older)
        manager.devices['timer'] = current

        manager.disconnect('timer', older)

        self.assertIs(manager.devices['timer'], current)

    async def test_stale_send_failures_keep_replacement_for_each_handled_error(self) -> None:
        for failure in (OSError('closed'), RuntimeError('closed'), WebSocketDisconnect(code=1006)):
            with self.subTest(error=type(failure).__name__):
                manager = DeviceManager()
                older = Mock(spec=WebSocket)
                current = Mock(spec=WebSocket)
                started = asyncio.Event()
                release = asyncio.Event()
                payload = {'requestId': 'req-456'}

                async def fail_send(_payload: dict[str, object]) -> None:
                    started.set()
                    await release.wait()
                    raise failure

                older.send_json.side_effect = fail_send
                await manager.connect('timer', older)
                pending = asyncio.create_task(manager.send('timer', payload))
                try:
                    await asyncio.wait_for(started.wait(), timeout=2)
                    await manager.connect('timer', current)
                finally:
                    release.set()
                    sent = await asyncio.wait_for(pending, timeout=2)

                self.assertFalse(sent)
                self.assertIs(manager.devices.get('timer'), current)
                self.assertTrue(await manager.send('timer', payload))
                current.send_json.assert_awaited_once_with(payload)

    async def test_failed_current_send_removes_connection(self) -> None:
        for failure in (OSError('closed'), RuntimeError('closed'), WebSocketDisconnect(code=1006)):
            with self.subTest(error=type(failure).__name__):
                manager = DeviceManager()
                current = Mock(spec=WebSocket)
                current.send_json.side_effect = failure
                await manager.connect('timer', current)

                self.assertFalse(await manager.send('timer', {'requestId': 'req-456'}))
                self.assertNotIn('timer', manager.devices)


if __name__ == '__main__':
    unittest.main()
