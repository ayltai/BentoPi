from os import path
from subprocess import CalledProcessError, TimeoutExpired, run
from tempfile import NamedTemporaryFile
from threading import Lock, RLock

from pygame import mixer

from ..utils.logging import log_error


class AudioController:
    _instance       = None
    _music_lock     = RLock()  # play() calls stop() while holding this lock.
    _speech_channel = None
    _speech_lock    = Lock()

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AudioController, cls).__new__(cls)

            mixer.init(frequency=44_100, size=16, channels=1)

        return cls._instance

    @staticmethod
    def play(file_path: str, loop: bool = True) -> None:
        with AudioController._music_lock:
            AudioController.stop()

            if not path.exists(file_path):
                raise FileNotFoundError(f'File not found: {file_path}')

            mixer.music.load(file_path)
            mixer.music.play(loops=-1 if loop else 0)

    @staticmethod
    def stop() -> None:
        with AudioController._music_lock:
            mixer.music.stop()
            mixer.music.unload()

    @staticmethod
    def speak(text: str) -> None:
        with AudioController._speech_lock:
            if AudioController._speech_channel:
                AudioController._speech_channel.stop()

            try:
                with NamedTemporaryFile(suffix='.wav') as audio_file:
                    run([
                        'espeak-ng',
                        '-v', 'en+f5',
                        '-s', '145',
                        '-p', '50',
                        '-w', audio_file.name,
                        text,
                    ], capture_output=True, check=True, timeout=10)

                    sound = mixer.Sound(audio_file.name)
                    channel = mixer.find_channel(force=True)
                    channel.play(sound)
                    AudioController._speech_channel = channel
            except (CalledProcessError, OSError, TimeoutExpired) as e:
                log_error(e)

                return
            except Exception as e:  # pylint: disable=broad-exception-caught
                log_error(e)
