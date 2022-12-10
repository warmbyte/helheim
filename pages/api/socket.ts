import { Server } from "socket.io";
import type { NextApiRequest } from "next";

const SocketHandler = (_: NextApiRequest, res: any) => {
  if (res.socket?.server?.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      socket.on("join-room", (msg) => {
        socket.broadcast.emit("join-room", msg);
      });
      socket.on("input-change", (msg) => {
        socket.broadcast.emit("update-input", msg);
      });
    });
  }
  res.end();
};

export default SocketHandler;
