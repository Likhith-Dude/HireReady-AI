"""WebSocket manager for real-time job feed, notifications, and AI streaming."""
import json
import logging
from typing import Dict, Set
from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from app.services.job_aggregator import search_jobs

logger = logging.getLogger(__name__)
router = APIRouter()


class ConnectionManager:
    def __init__(self):
        # user_id → set of WebSocket connections
        self.active: Dict[str, Set[WebSocket]] = {}
        # anonymous connections
        self.anon: Set[WebSocket] = set()

    async def connect(self, ws: WebSocket, user_id: str = None):
        await ws.accept()
        if user_id:
            self.active.setdefault(user_id, set()).add(ws)
        else:
            self.anon.add(ws)
        logger.info(f"[WS] Connected user={user_id or 'anon'}, total={self.total()}")

    def disconnect(self, ws: WebSocket, user_id: str = None):
        if user_id and user_id in self.active:
            self.active[user_id].discard(ws)
        self.anon.discard(ws)
        logger.info(f"[WS] Disconnected user={user_id or 'anon'}, total={self.total()}")

    def total(self) -> int:
        return sum(len(v) for v in self.active.values()) + len(self.anon)

    async def send_to_user(self, user_id: str, message: dict):
        for ws in list(self.active.get(user_id, [])):
            try:
                await ws.send_json(message)
            except Exception:
                self.active[user_id].discard(ws)

    async def broadcast(self, message: dict):
        all_ws = set(self.anon)
        for ws_set in self.active.values():
            all_ws.update(ws_set)
        for ws in list(all_ws):
            try:
                await ws.send_json(message)
            except Exception:
                self.anon.discard(ws)


manager = ConnectionManager()


@router.websocket("/ws")
async def websocket_endpoint(ws: WebSocket, token: str = None):
    user_id = None
    if token:
        try:
            from jose import jwt
            from app.config import settings
            payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
            user_id = payload.get("sub")
        except Exception:
            pass

    await manager.connect(ws, user_id)
    try:
        await ws.send_json({"type": "connected", "message": "HireReady AI connected", "user": user_id})
        while True:
            data = await ws.receive_json()
            event = data.get("type")

            if event == "job_search":
                title = data.get("title", "")
                location = data.get("location", "")
                await ws.send_json({"type": "searching", "message": f"Searching for {title}..."})
                result = search_jobs(title, location, limit=10)
                await ws.send_json({"type": "job_results", **result})

            elif event == "ping":
                await ws.send_json({"type": "pong"})

            elif event == "status_update":
                # Broadcast application status change to user's other sessions
                if user_id:
                    await manager.send_to_user(user_id, {
                        "type": "application_updated",
                        "app_id": data.get("app_id"),
                        "status": data.get("status"),
                    })

    except WebSocketDisconnect:
        manager.disconnect(ws, user_id)
    except Exception as e:
        logger.error(f"[WS] Error: {e}")
        manager.disconnect(ws, user_id)
