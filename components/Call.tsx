import { useState, useRef } from "react";
import { Peer } from "peerjs";
import { Box, Stack } from "@chakra-ui/react";
import { io } from "socket.io-client";
import { useMount } from "react-use";
let peer: Peer = null as any;
let myStream: MediaStream = null as any;

const Call = () => {
  const [_, setMyId] = useState<string>();
  const boxRef = useRef<HTMLDivElement>(null);

  useMount(() => {
    const init = async () => {
      await fetch("/api/socket");
      const socket = io({ autoConnect: true, transports: ["websocket"] });

      myStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      peer = new Peer(socket.id);
      peer.on("open", () => {
        setMyId(peer.id);

        socket.emit("join-room", peer.id);

        socket.on("member-leave", (leaveId: string) => {
          const leaveVideo = document.getElementById(leaveId);
          if (leaveVideo) leaveVideo.remove();
        });

        socket.on("members", (members: string[]) => {
          members = members;
          members.forEach((member) => {
            if (member !== peer.id) {
              const call = peer.call(member, myStream);
              call.on("stream", (peerStream) => {
                if (!document.getElementById(call.peer)) {
                  const video = document.createElement("video");
                  video.id = call.peer;
                  video.autoplay = true;
                  video.srcObject = peerStream;
                  boxRef.current!.appendChild(video);
                }
              });
            }
          });
        });

        const myVid = document.createElement("video");
        myVid.id = peer.id;
        myVid.style.position = "fixed";
        myVid.style.right = "0";
        myVid.style.bottom = "0";
        myVid.style.zIndex = "99";
        myVid.autoplay = true;
        myVid.srcObject = myStream;
        myVid.volume = 0;
        myVid.style.width = "200px";
        myVid.style.height = "150px";
        document.body.appendChild(myVid);

        peer.on("call", (call) => {
          call.answer(myStream);

          call.on("stream", (peerStream) => {
            if (!document.getElementById(call.peer)) {
              const video = document.createElement("video");
              video.id = call.peer;
              video.autoplay = true;
              video.srcObject = peerStream;
              boxRef.current!.appendChild(video);
            }
          });
        });
      });
    };

    init();
  });

  return (
    <Box>
      <Box display="flex" flexWrap="wrap" width="100vw" ref={boxRef} />
      <Stack
        w="full"
        flexDirection="row"
        py="2"
        borderColor="gray.200"
        borderTopWidth="2px"
        borderStyle="solid"
        position="fixed"
        align="center"
        justify="center"
        bottom="0"
        left="0"
      ></Stack>
    </Box>
  );
};

export default Call;
