import { Server } from "socket.io";
import type { NextApiRequest } from "next";

const members: Set<string> = new Set();
const memberMap: Map<string, { peerId: string }> = new Map();
const peerToSocketMap: Map<string, string> = new Map();

const SocketHandler = (_: NextApiRequest, res: any) => {
  if (res.socket?.server?.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      socket.on("join_call", (peerId: string) => {
        memberMap.set(socket.id, { peerId });
        peerToSocketMap.set(peerId, socket.id);

        socket.emit(
          "member_list",
          Array.from(memberMap).map((item) => item[1].peerId)
        );
      });

      socket.on("disconnect", () => {
        const peerId = memberMap.get(socket.id)?.peerId;
        if (peerId) {
          memberMap.delete(socket.id);
          peerToSocketMap.delete(peerId);
          socket.broadcast.emit("member_leave", peerId);
        }
      });

      socket.on("join-room", (peerId) => {
        socket.emit("members", Array.from(members));
        (socket as any).peerId = peerId;
        members.add(peerId);
      });

      socket.on("disconnect", () => {
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
