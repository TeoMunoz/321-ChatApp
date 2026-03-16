import { useState } from "react";
import "./App.css";
import Login from "./components/Login";

function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [messages, setMessages] = useState([
        { text: "Hola 👋", sender: "other" },
        { text: "I am Alpharius", sender: "other" }
    ]);
    const [input, setInput] = useState("");

    const handleLogin = (username) => {
        setCurrentUser(username);
    };

    const sendMessage = () => {
        if (input.trim() === "") return;
        setMessages([...messages, { text: input, sender: "me" }]);
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
                        className={msg.sender === "me" ? "message me" : "message other"}
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