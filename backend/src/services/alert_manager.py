from fastapi import WebSocket, WebSocketDisconnect


class AlertManager:
    def __init__(self):
        self.clients: set[WebSocket] = set()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()

        self.clients.add(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        self.clients.discard(websocket)

    async def broadcast(self, payload: dict[str, str]) -> int:
        notified = 0

        for websocket in list(self.clients):
            try:
                await websocket.send_json(payload)

                notified += 1
            except (OSError, RuntimeError, WebSocketDisconnect):
                self.disconnect(websocket)

        return notified
