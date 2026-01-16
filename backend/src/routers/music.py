from os import path

from fastapi import APIRouter, BackgroundTasks

from ..media.audio_controller import AudioController

router = APIRouter(prefix='/api/v1/music', tags=['music'])


@router.get('/play/{track_name}', summary='Play a music track')
async def play_music(track_name: str, background_tasks: BackgroundTasks) -> None:
    """Play a music track."""
    background_tasks.add_task(AudioController.play, path.join(path.dirname(__file__), '..', '..', f'assets/{track_name}.wav'))


@router.get('/stop', summary='Stop music playback')
async def stop_music(background_tasks: BackgroundTasks) -> None:
    """Stop music playback."""
    background_tasks.add_task(AudioController.stop)
