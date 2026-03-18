from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# List of connections (max 2)
connected_users: list[dict] = []  # [{ "ws": WebSocket, "username": str }]

@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    # max 2 users
    if len(connected_users) >= 2:
        await websocket.close(code=1008)
        return

    await websocket.accept()
    connected_users.append({"ws": websocket, "username": username})
    print(f"{username} connected. User: {[u['username'] for u in connected_users]}")

    # notification wen new user join
    await broadcast({"type": "system", "text": f"{username} entró al chat"}, sender=None)

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            # send message to rest of users
            await broadcast(
                {"type": "message", "sender": username, "text": message["text"]},
                sender=websocket
            )
    except WebSocketDisconnect:
        connected_users[:] = [u for u in connected_users if u["ws"] != websocket]
        print(f"{username} disconnected.")
        await broadcast({"type": "system", "text": f"{username} left the chat"}, sender=None)


async def broadcast(message: dict, sender: WebSocket | None):
    for user in connected_users:
        if user["ws"] != sender:
            await user["ws"].send_text(json.dumps(message))