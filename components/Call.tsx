import { useState, useRef } from "react";
import { Peer } from "peerjs";
import { io } from "socket.io-client";
import { Box, Text } from "@chakra-ui/react";
import { useMount } from "react-use";
import { subscribeWithSelector } from "zustand/middleware";
import create from "zustand";

interface IStore {
  party: Record<string, boolean>;
}
const useStore = create(
  subscribeWithSelector<IStore>(() => ({
    party: {},
  }))
);

let peer: Peer = null as any;
let myStream: MediaStream = null as any;
// const videoListRef: any = {};

const Call = () => {
  const [myId, setMyId] = useState<string>();
  const boxRef = useRef<HTMLDivElement>(null);

  useMount(() => {
    const subs = useStore.subscribe(
      (state) => state.party,
      (party) => {
        const keys = Object.keys(party);
        for (let i = 0; i < keys.length; i++) {
          const partyId = keys[i];
          if (party[partyId]) return;

          const conn = peer.call(partyId, myStream);
          conn.on("stream", (peerStream) => {
            // if (videoListRef[conn.peer]) return;
            if (!document.getElementById(conn.peer)) {
              const video = document.createElement("video");
              video.id = conn.peer;
              video.autoplay = true;
              video.srcObject = peerStream;
              boxRef.current!.appendChild(video);
            }
            // videoListRef[conn.peer] = true;
          });

          useStore.setState((prev) => ({
            party: {
              ...prev.party,
              [partyId]: true,
            },
          }));
        }
      }
    );

    const init = async () => {
      await fetch("/api/socket");
      const socket = io({ autoConnect: true });

      myStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      peer = new Peer();
      peer.on("open", () => {
        setMyId(peer.id);

        socket.emit("join-room", peer.id);
        socket.on("join-room", (message) => {
          socket.emit("join-room", peer.id);
          if (message === peer.id) return;
          if (useStore.getState().party[message] !== undefined) return;
          useStore.setState((prev) => ({
            party: {
              ...prev.party,
              [message]: false,
            },
          }));
        });

        peer.on("call", (call) => {
          call.answer(myStream);

          call.on("stream", (peerStream) => {
            // if (videoListRef[call.peer]) return;
            if (!document.getElementById(call.peer)) {
              const video = document.createElement("video");
              video.id = call.peer;
              video.autoplay = true;
              video.srcObject = peerStream;
              boxRef.current!.appendChild(video);
            }
            // videoListRef[call.peer] = true;
          });
        });
      });
    };

    init();
    return subs;
  });

  return (
    <Box>
      <Text>Your ID: {myId}</Text>
      <Box ref={boxRef} />
    </Box>
  );
};

export default Call;
