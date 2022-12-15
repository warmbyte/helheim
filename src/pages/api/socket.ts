import { Server } from "socket.io";
import type { NextApiRequest } from "next";

const memberMap: Map<string, { peerId: string }> = new Map();
const peerToSocketMap: Map<string, string> = new Map();
const timeoutMap: Map<string, NodeJS.Timeout> = new Map();

const createTimeout = (peerId: string, cb: () => void) => {
  if (timeoutMap.has(peerId)) {
    clearTimeout(timeoutMap.get(peerId));
  }

  const timeout = setTimeout(cb, 1000 * 10);
  timeoutMap.set(peerId, timeout);
};

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

        createTimeout(peerId, () => {
          memberMap.delete(socket.id);
          peerToSocketMap.delete(peerId);
          socket.broadcast.emit("member_leave", peerId);
        });

        socket.emit(
          "member_list",
          Array.from(memberMap).map((item) => item[1].peerId)
        );
      });

      socket.on("ping", (peerId: string) => {
        createTimeout(peerId, () => {
          memberMap.delete(socket.id);
          peerToSocketMap.delete(peerId);
          socket.broadcast.emit("member_leave", peerId);
        });
      });
    });
  }
  res.end();
};

export default SocketHandler;
