import { io } from "socket.io-client";

const socket = io("https://collab-tool-backend-hqab.onrender.com");

export default socket;
