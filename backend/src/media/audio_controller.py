from io import BytesIO
from os import path
from subprocess import CalledProcessError, TimeoutExpired, run
from threading import Lock

from pygame import mixer

from ..utils.logging import log_error


class AudioController:
    _instance       = None
    _speech_channel = None
    _speech_lock    = Lock()

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AudioController, cls).__new__(cls)

            mixer.init(frequency=44_100, size=16, channels=1)

        return cls._instance

    @staticmethod
    def play(file_path: str) -> None:
        AudioController.stop()

        if not path.exists(file_path):
            raise FileNotFoundError(f'File not found: {file_path}')

        try:
            mixer.music.load(file_path)
            mixer.music.play(loops=-1)
        except Exception as e:  # pylint: disable=broad-exception-caught
            log_error(e)

    @staticmethod
    def stop():
        mixer.music.stop()
        mixer.music.unload()

    @staticmethod
    def speak(text: str) -> None:
        with AudioController._speech_lock:
            if AudioController._speech_channel:
                AudioController._speech_channel.stop()

            try:
                result = run([
                    'espeak-ng',
                    '-v', 'en+f5',
                    '-s', '145',
                    '-p', '50',
                    '--stdout',
                    text,
                ], capture_output=True, check=True, timeout=10)
            except (CalledProcessError, OSError, TimeoutExpired) as e:
                log_error(e)

                return

            try:
                sound = mixer.Sound(file=BytesIO(result.stdout))
                
                AudioController._speech_channel = mixer.find_channel(force=True)
                AudioController._speech_channel.play(sound)
            except Exception as e:  # pylint: disable=broad-exception-caught
                log_error(e)
