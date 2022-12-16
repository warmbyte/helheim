import { Server } from "socket.io";
import type { NextApiRequest } from "next";

type MemberMap = Map<string, { peerId: string }>;
type PeerToSocketMap = Map<string, string>;
type TimeoutMap = Map<string, NodeJS.Timeout>;
const roomMap: Map<string, [MemberMap, PeerToSocketMap, TimeoutMap]> =
  new Map();

const createTimeout = (room: string, peerId: string, cb: () => void) => {
  const [, , timeoutMap] = roomMap.get(room)!;
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
      socket.on(
        "join_call",
        ({ peerId, room }: { peerId: string; room: string }) => {
          if (!roomMap.get(room)) {
            roomMap.set(room, [new Map(), new Map(), new Map()]);
          }
          const [memberMap, peerToSocketMap] = roomMap.get(room)!;
          socket.join(room);
          memberMap.set(socket.id, { peerId });
          peerToSocketMap.set(peerId, socket.id);

          createTimeout(room, peerId, () => {
            memberMap.delete(socket.id);
            peerToSocketMap.delete(peerId);
            socket.broadcast.to(room).emit("member_leave", peerId);
          });

          socket.emit(
            "member_list",
            Array.from(memberMap).map((item) => item[1].peerId)
          );
        }
      );

      socket.on(
        "ping",
        ({ peerId, room }: { peerId: string; room: string }) => {
          const [memberMap, peerToSocketMap] = roomMap.get(room)!;
          createTimeout(room, peerId, () => {
            memberMap.delete(socket.id);
            peerToSocketMap.delete(peerId);
            socket.broadcast.to(room).emit("member_leave", peerId);
          });
        }
      );
    });
  }
  res.end();
};

export default SocketHandler;
