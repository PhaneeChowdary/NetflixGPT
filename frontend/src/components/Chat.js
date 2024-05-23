import React, { useState } from "react";
import axios from "axios";
import "./Chat.css";

function Chat() {
    const [message, setMessage] = useState("");
    const [response, setResponse] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        setLoading(true);
        try {
            console.log("Sending message:", message); // Debugging line
            const res = await axios.post("http://127.0.0.1:5000/chat", {
                message,
            });
            console.log("Received response:", res.data); // Debugging line
            setResponse(res.data.movies || []); // Ensure response is an array
            setError("");
        } catch (error) {
            console.error("Error sending message:", error);
            if (error.response) {
                setError(`Error: ${error.response.data.error}`);
            } else {
                setError("Error sending message, please try again.");
            }
        }
        setLoading(false);
    };

    const renderResponse = () => {
        return (
            <div className="chat-response">
                {response.map((movie, index) => (
                    <div key={index} className="movie-item">
                        <h4>
                            {movie.title} ({movie.year})
                        </h4>
                        <p>{movie.description}</p>
                        {movie.poster && (
                            <img
                                src={movie.poster}
                                alt={movie.title}
                                style={{ width: "100px", height: "150px" }}
                            />
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="chat">
            <h2>Chat with GPT</h2>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask something..."
            />
            <button onClick={handleSend} disabled={loading}>
                Send
            </button>
            {loading && <div className="spinner"></div>}
            {error && <p className="error">{error}</p>}
            {response.length > 0 && renderResponse()}
        </div>
    );
}

export default Chat;
