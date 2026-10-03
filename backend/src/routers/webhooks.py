from fastapi import APIRouter, BackgroundTasks, status
from pydantic import AnyHttpUrl, BaseModel, Field, field_validator

from ..media.audio_controller import AudioController
from ..services import alert_manager

router  = APIRouter(prefix='/api/v1/webhooks', tags=['webhooks'])


class Alert(BaseModel):
    label    : str = Field(min_length=1, max_length=200)
    snapshot : AnyHttpUrl

    @field_validator('label', mode='before')
    @classmethod
    def strip_label(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value


@router.post('/alerts', status_code=status.HTTP_202_ACCEPTED)
async def alert(alert: Alert, background_tasks: BackgroundTasks) -> dict[str, int]:
    background_tasks.add_task(AudioController.speak, alert.label)

    notified = await alert_manager.broadcast({
        'label'    : alert.label,
        'snapshot' : str(alert.snapshot),
    })

    return {
        'notified': notified,
    }
