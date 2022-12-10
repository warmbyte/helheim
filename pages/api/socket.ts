import { Server } from "socket.io";
import type { NextApiRequest } from "next";

const members: Set<string> = new Set();

const SocketHandler = (_: NextApiRequest, res: any) => {
  if (res.socket?.server?.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      socket.on("join-room", (peerId) => {
        socket.emit("members", Array.from(members));
        (socket as any).peerId = peerId;
        members.add(peerId);
      });

      socket.on("disconnect", () => {
        console.log("disconnected", (socket as any).peerId);
        members.delete((socket as any).peerId);
        socket.broadcast.emit("member-leave", (socket as any).peerId);
      });

      socket.on("input-change", (msg) => {
        socket.broadcast.emit("update-input", msg);
      });
    });
  }
  res.end();
};

export default SocketHandler;
