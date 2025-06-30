import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket";

function Editor() {
  const [username, setUsername] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [text, setText] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const textRef = useRef("");
  const { roomId } = useParams();

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  useEffect(() => {
    const name = prompt("Enter your name") || "Anonymous";
    setUsername(name);

    socket.emit("join-room", roomId);

    socket.on("receive-changes", (content) => {
      setText(content);
      textRef.current = content;
    });

    socket.on("receive-message", (message) => {
      setChatLog((prev) => [...prev, message]);
    });

    socket.on("user-typing", (name) => {
      setTypingUser(name);
      setTimeout(() => setTypingUser(""), 2000);
    });

    return () => {
      socket.off("receive-changes");
      socket.off("receive-message");
      socket.off("user-typing");
    };
  }, [roomId]);

  const handleChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    textRef.current = newText;
    socket.emit("send-changes", { roomId, content: newText });
  };

  const handleTyping = (e) => {
    setChatMessage(e.target.value);
    socket.emit("typing", { roomId, username });

    if (!isTyping) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    }
  };

  const sendMessage = () => {
    if (chatMessage.trim()) {
      const timestamp = new Date().toLocaleTimeString();
      const message = {
        username,
        text: chatMessage,
        time: timestamp,
      };
      socket.emit("send-message", { roomId, message });
      setChatLog((prev) => [...prev, message]);
      setChatMessage("");
    }
  };

  return (
    <div
      className={darkMode ? "dark-mode" : "light-mode"}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: darkMode ? "#121212" : "#ffffff",
        color: darkMode ? "#ffffff" : "#000000",
      }}
    >
      <button
        onClick={toggleTheme}
        style={{
          alignSelf: "flex-end",
          margin: "10px",
          padding: "6px 12px",
          backgroundColor: darkMode ? "#333" : "#008cff",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      <div style={{ display: "flex", flex: 1 }}>
        <div style={{ flex: 3 }}>
          <textarea
            value={text}
            onChange={handleChange}
            style={{
              width: "100%",
              height: "90vh",
              padding: "10px",
              fontSize: "16px",
              backgroundColor: darkMode ? "#1e1e1e" : "#fff",
              color: darkMode ? "#fff" : "#000",
              border: "1px solid",
              borderColor: darkMode ? "#444" : "#ccc",
            }}
            placeholder={`Editing Room: ${roomId}`}
          />
        </div>

        <div
          style={{
            flex: 1,
            borderLeft: "1px solid #ccc",
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            height: "90vh",
          }}
        >
          <h3>💬 Chat</h3>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              marginBottom: "10px",
              backgroundColor: darkMode ? "#1e1e1e" : "#f9f9f9",
              padding: "5px",
              borderRadius: "5px",
            }}
          >
            {chatLog.map((msg, i) => (
              <div key={i} style={{ marginBottom: "6px" }}>
                <strong>{msg.username}</strong>{" "}
                <small style={{ color: darkMode ? "#aaa" : "gray" }}>{msg.time}</small>
                <br />
                {msg.text}
              </div>
            ))}
          </div>

          {typingUser && (
            <p
              style={{
                color: darkMode ? "#aaa" : "gray",
                fontStyle: "italic",
                marginBottom: "5px",
              }}
            >
              {typingUser} is typing...
            </p>
          )}

          <div style={{ display: "flex" }}>
            <input
              value={chatMessage}
              onChange={handleTyping}
              style={{
                flex: 1,
                padding: "8px",
                backgroundColor: darkMode ? "#2c2c2c" : "#fff",
                color: darkMode ? "#fff" : "#000",
                border: "1px solid",
                borderColor: darkMode ? "#555" : "#ccc",
              }}
              placeholder="Type message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              style={{
                padding: "8px 10px",
                backgroundColor: darkMode ? "#444" : "#008cff",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                marginLeft: "5px",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Editor;
