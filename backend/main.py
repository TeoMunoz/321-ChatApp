from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import sqlite3
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Database
def init_db():
    conn = sqlite3.connect("chat.db")
    conn.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT NOT NULL,
            text TEXT NOT NULL,
            timestamp TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

def save_message(sender: str, text: str):
    conn = sqlite3.connect("chat.db")
    timestamp = datetime.now().isoformat()
    conn.execute(
        "INSERT INTO messages (sender, text, timestamp) VALUES (?, ?, ?)",
        (sender, text, timestamp)
    )
    conn.commit()
    conn.close()

def get_messages():
    conn = sqlite3.connect("chat.db")
    cursor = conn.execute("SELECT sender, text, timestamp FROM messages ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()
    return [{"type": "message", "sender": r[0], "text": r[1], "timestamp": r[2]} for r in rows]

init_db()

# Websocket
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

    history = get_messages()
    await websocket.send_text(json.dumps({"type": "history", "messages": history}))

    # notification wen new user join
    await broadcast({"type": "system", "text": f"{username} entró al chat"}, sender=None)

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            save_message(username, message["text"])
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