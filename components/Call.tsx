import { useRef, useEffect } from "react";
import { DataConnection, Peer } from "peerjs";
import {
  Button,
  Box,
  Wrap,
  WrapItem,
  HStack,
  AspectRatio,
} from "@chakra-ui/react";
import { io } from "socket.io-client";
import { useMount } from "react-use";
import create from "zustand";
import VideoStream from "../lib/VideoStream";
let peer: Peer = null as any;
let myStream: MediaStream = null as any;
let peerConnection: Record<string, DataConnection> = {};
let interval: NodeJS.Timer = null as any;

interface IStore {
  streamList: Record<string, VideoStream>;
  isMuted: boolean;
  isCamOff: boolean;
}

const useStore = create<IStore>(() => ({
  streamList: {},
  isMuted: false,
  isCamOff: false,
}));
const { setState, getState } = useStore;

const Call = () => {
  const { streamList, isMuted, isCamOff } = useStore();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (interval !== null) clearInterval(interval);
    interval = setInterval(() => {
      try {
        Object.values(peerConnection).forEach((conn) => {
          if (isCamOff) {
            conn.send({ type: "camOff", value: peer.id });
          } else {
            conn.send({ type: "camOn", value: peer.id });
          }

          if (isMuted) {
            conn.send({ type: "mute", value: peer.id });
          } else {
            conn.send({ type: "unmute", value: peer.id });
          }
        });
      } catch (error) {}
    }, 200);
  }, [isMuted, isCamOff, streamList]);

  const handleCam = () => {
    setState((prev) => ({ isCamOff: !prev.isCamOff }));
  };

  const handleMute = () => {
    setState((prev) => ({ isMuted: !prev.isMuted }));
  };

  const addStream = (id: string) => (stream: MediaStream) => {
    setState((prev) => ({
      streamList: {
        ...prev.streamList,
        [id]: new VideoStream(stream),
      },
    }));
  };

  const removeStream = (id: string) => {
    delete peerConnection[id];
    setState((prev) => {
      let _prevStreamList = Object.assign({}, prev.streamList);
      delete _prevStreamList[id];
      return { streamList: _prevStreamList };
    });
  };

  const dataHandler = (data: any) => {
    if (data.type === "camOn") {
      getState().streamList[data.value].camOn();
    }

    if (data.type === "camOff") {
      getState().streamList[data.value].camOff();
    }

    if (data.type === "mute") {
      getState().streamList[data.value].mute();
    }

    if (data.type === "unmute") {
      getState().streamList[data.value].unmute();
    }
  };

  useMount(() => {
    const init = async () => {
      await fetch("/api/socket");
      const socket = io({ autoConnect: true, transports: ["websocket"] });

      myStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      peer = new Peer(socket.id);
      peer.on("connection", (conn) => {
        peerConnection[conn.peer] = conn;
        conn.on("data", dataHandler);
      });
      peer.on("open", () => {
        socket.emit("join-room", peer.id);
        socket.on("member-leave", removeStream);
        socket.on("members", (members: string[]) => {
          members.forEach((member) => {
            if (member !== peer.id) {
              const call = peer.call(member, myStream);
              const conn = peer.connect(member);
              peerConnection[member] = conn;

              conn.on("data", dataHandler);
              call.on("stream", addStream(member));
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
          call.on("stream", addStream(call.peer));
        });
      });
    };

    init();
  });

  return (
    <Box>
      <Box display="flex" flexWrap="wrap" width="100vw" ref={boxRef} />
      <Wrap w="full" spacing="0">
        {Object.keys(streamList).map((key) => (
          <WrapItem
            w={{ base: "100vw", sm: "100vw", md: "50vw", lg: "33.333vw" }}
            key={key}
            id={`wrapper-${key}`}
          >
            <AspectRatio w="full" ratio={16 / 9}>
              {streamList[key].render()}
            </AspectRatio>
          </WrapItem>
        ))}
      </Wrap>
      <HStack
        bg="white"
        w="full"
        py="2"
        borderColor="gray.200"
        borderTopWidth="2px"
        borderStyle="solid"
        position="fixed"
        align="center"
        justify="center"
        bottom="0"
        left="0"
      >
        <Button colorScheme={isMuted ? "red" : undefined} onClick={handleMute}>
          {isMuted ? "Unmute" : "Mute"}
        </Button>
        <Button colorScheme={isCamOff ? "red" : undefined} onClick={handleCam}>
          {isCamOff ? "Cam On" : "Cam Off"}
        </Button>
      </HStack>
    </Box>
  );
};

export default Call;
