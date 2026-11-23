from os import path

from fastapi import APIRouter, HTTPException, status
from fastapi.concurrency import run_in_threadpool

from ..media.audio_controller import AudioController

router = APIRouter(prefix='/api/v1/music', tags=['music'])


@router.get('/play/{track_name}', summary='Play a music track')
async def play_music(track_name: str, loop: bool = True) -> None:
    """Play a music track, looping by default."""
    try:
        await run_in_threadpool(
            AudioController.play,
            path.join(path.dirname(__file__), '..', '..', f'assets/{track_name}.wav'),
            loop,
        )
    except FileNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Track not found: {track_name}') from error


@router.get('/stop', summary='Stop music playback')
async def stop_music() -> None:
    """Stop music playback."""
    await run_in_threadpool(AudioController.stop)
