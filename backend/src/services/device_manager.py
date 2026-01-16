from fastapi import WebSocket, WebSocketDisconnect


class DeviceManager:
    def __init__(self):
        self.devices: dict[str, WebSocket] = {}

    async def connect(self, device_id: str, websocket: WebSocket) -> None:
        await websocket.accept()

        self.devices[device_id] = websocket

    def disconnect(self, device_id: str) -> None:
        if device_id in self.devices:
            del self.devices[device_id]

    async def send(self, device_id: str, payload: dict[str, ...]) -> bool:
        websocket = self.devices.get(device_id)
        if websocket:
            try:
                await websocket.send_json(payload)

                return True
            except WebSocketDisconnect:
                self.disconnect(device_id)

        return False
