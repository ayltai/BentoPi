from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from ..services import alert_manager, device_manager

router = APIRouter(prefix='/ws', tags=['websocket'])


@router.websocket('/alerts')
async def alerts_endpoint(websocket: WebSocket) -> None:
    await alert_manager.connect(websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        alert_manager.disconnect(websocket)


@router.websocket('/{device_id}')
async def device_endpoint(websocket: WebSocket, device_id: str) -> None:
    await device_manager.connect(device_id, websocket)

    try:
        while True:
            message   = await websocket.receive_json()
            target_id = message.get('target_id')

            if target_id:
                await device_manager.send(target_id, message.get('payload'))
    except WebSocketDisconnect:
        device_manager.disconnect(device_id)
