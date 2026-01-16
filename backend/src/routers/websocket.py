from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from ..services import DeviceManager

router  = APIRouter(prefix='/ws', tags=['websocket'])
manager = DeviceManager()


@router.websocket('/{device_id}')
async def websocket_endpoint(websocket: WebSocket, device_id: str) -> None:
    await manager.connect(device_id, websocket)

    try:
        while True:
            message   = await websocket.receive_json()
            target_id = message.get('target_id')

            if target_id:
                await manager.send(target_id, message.get('payload'))
    except WebSocketDisconnect:
        manager.disconnect(device_id)
