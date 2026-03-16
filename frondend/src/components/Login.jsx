import { useState } from "react";

function Login({ onLogin }) {
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");

    const handleLogin = () => {
        if (username.trim() === "") {
            setError("ENTER A VALID NAME!");
            return;
        }
        onLogin(username.trim());
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleLogin();
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-avatar">💬</div>
                <h1 className="login-title">Wellcome to Wassap</h1>
                <p className="login-subtitle">Enter a name</p>

                <input
                    className="login-input"
                    type="text"
                    placeholder="Username..."
                    value={username}
                    onChange={(e) => {
                        setUsername(e.target.value);
                        setError("");
                    }}
                    onKeyDown={handleKeyDown}
                    autoFocus
                />

                {error && <p className="login-error">{error}</p>}

                <button className="login-button" onClick={handleLogin}>
                    Enter in Chat chat →
                </button>
            </div>
        </div>
    );
}

export default Login;