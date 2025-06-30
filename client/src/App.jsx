import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Editor from "./components/Editor";
import { v4 as uuidv4 } from "uuid";

function App() {
  const navigate = useNavigate();

  const createRoom = () => {
    const newRoomId = uuidv4();
    navigate(`/room/${newRoomId}`);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>📝 Real-Time Collaboration Tool</h1>
            <button onClick={createRoom} style={{ padding: "10px 20px", fontSize: "16px" }}>
              ➕ Create New Room
            </button>
          </div>
        }
      />
      <Route path="/room/:roomId" element={<Editor />} />
    </Routes>
  );
}

export default App;
