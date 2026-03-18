import { useState, useEffect, useRef } from "react";
import "./App.css";
import Login from "./components/Login";

function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [messages, setMessages] = useState([
        { text: "Hola 👋", sender: "other" },
        { text: "I am Alpharius", sender: "other" }
    ]);
    const [input, setInput] = useState("");
    const [status, setStatus] = useState("disconnected");
    const ws = useRef(null);

    useEffect(() => {
        if (!currentUser) return;

        const socket = new WebSocket(`ws://localhost:8000/ws/${currentUser}`);
        ws.current = socket;

        socket.onopen = () => setStatus("conectado");

        socket.onclose = (e) => {
            if (e.code === 1008) {
                setStatus("sala llena");
                setCurrentUser(null);
                alert("La sala ya está llena (máximo 2 usuarios).");
            } else {
                setStatus("desconectado");
            }
        };

        socket.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            setMessages((prev) => [...prev, msg]);
        };

        return () => socket.close();
    }, [currentUser]);

    const handleLogin = (username) => {
        setCurrentUser(username);
    };

    const sendMessage = () => {
        if (input.trim() === "" || ws.current?.readyState !== WebSocket.OPEN) return;
        setMessages((prev) => [...prev, { type: "message", sender: currentUser, text: input }]);
        ws.current.send(JSON.stringify({ text: input }));
        setInput("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") sendMessage();
    };

    if (!currentUser) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className="chat-container">
            <div className="chat-header">
                💬 Mi Chat — <span style={{ fontWeight: "normal", opacity: 0.8 }}>{currentUser}</span>
            </div>

            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={msg.sender === currentUser ? "message me" : "message other"}
                    >
                        {msg.text}
                    </div>
                ))}
            </div>

            <div className="chat-input">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message..."
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}

export default App;