import { useState } from "react";
import "./App.css";

function App() {
    const [messages, setMessages] = useState([
        { text: "Hola 👋", sender: "other" },
        { text: "I am Alpharius", sender: "other" }
    ]);

    const [input, setInput] = useState("");

    const sendMessage = () => {
        if (input.trim() === "") return;

        const newMessage = { text: input, sender: "me" };
        setMessages([...messages, newMessage]);
        setInput("");
    };

    return (
        <div className="chat-container">
            <div className="chat-header">Mi Chat</div>

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
                    placeholder="Mesage..."
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}

export default App;