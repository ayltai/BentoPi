from os import path

from pygame import mixer

from ..utils.logging import log_error


class AudioController:
    _instance = None

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
        except Exception as e:
            log_error(e)

    @staticmethod
    def stop():
        mixer.music.stop()
        mixer.music.unload()
