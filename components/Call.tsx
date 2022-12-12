import { useRef } from "react";
import { DataConnection, MediaConnection, Peer } from "peerjs";
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
let callConnection: Record<string, MediaConnection> = {};

interface IStore {
  streamList: Record<string, VideoStream>;
  isSoundEnabled: boolean;
  isCamEnabled: boolean;
}

const useStore = create<IStore>(() => ({
  streamList: {},
  isSoundEnabled: true,
  isCamEnabled: true,
}));
const { setState } = useStore;

const Call = () => {
  const { streamList, isSoundEnabled, isCamEnabled } = useStore();
  const boxRef = useRef<HTMLDivElement>(null);

  const silence = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const stream = ctx.createMediaStreamDestination();
    oscillator.connect(stream);
    oscillator.start();
    const audioTrack = stream.stream.getAudioTracks()[0];
    audioTrack.enabled = false;
    return audioTrack;
  };

  const handleShareAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: {
          sampleSize: 24,
          channelCount: 1,
          sampleRate: 48000,
          noiseSuppression: false,
          echoCancellation: false,
          autoGainControl: false,
          suppressLocalAudioPlayback: false,
        },
      });
      const [track] = stream.getAudioTracks();
      track.applyConstraints({});
      Object.values(callConnection).forEach((call) => {
        const [, sender] = call.peerConnection.getSenders();
        myStream.getAudioTracks()[1] = track;
        sender.replaceTrack(track);
      });
    } catch (error) {}
  };

  const handleCam = () => {
    myStream.getVideoTracks().forEach((track) => {
      track.enabled = !isCamEnabled;
    });
    setState({ isCamEnabled: !isCamEnabled });
  };

  const handleMute = () => {
    const [track] = myStream.getAudioTracks();
    track.enabled = !isSoundEnabled;
    setState({ isSoundEnabled: !isSoundEnabled });
  };

  const addStream = (id: string) => (stream: MediaStream) => {
    setState((prev) => ({
      streamList: {
        ...prev.streamList,
        [id]: new VideoStream(stream),
      },
    }));
  };

  const handleTrack = (id: string) => (e: RTCTrackEvent) => {
    const video = document.getElementById(id) as HTMLVideoElement;
    if (!video) {
      addStream(id)(e.streams[0]);
    } else {
      video.srcObject = e.streams[0];
    }
  };

  const removeStream = (id: string) => {
    delete peerConnection[id];
    setState((prev) => {
      let _prevStreamList = Object.assign({}, prev.streamList);
      delete _prevStreamList[id];
      return { streamList: _prevStreamList };
    });
  };

  const dataHandler = (data: any) => {};

  useMount(() => {
    const init = async () => {
      await fetch("/api/socket");
      const socket = io({ autoConnect: true, transports: ["websocket"] });

      if (!myStream) {
        myStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: {
            sampleSize: 24,
            channelCount: 2,
          },
        });
        myStream.addTrack(silence());
      }

      peer = new Peer(socket.id);
      peer.on("connection", (conn) => {
        if (!conn) return;
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
              callConnection[member] = call;

              conn.on("data", dataHandler);
              call.peerConnection.ontrack = handleTrack(member);
            }
          });
        });

        const myVid = document.createElement("video");
        myVid.id = peer.id;
        myVid.style.position = "fixed";
        myVid.style.right = "0";
        myVid.style.bottom = "60px";
        myVid.style.zIndex = "99";
        myVid.autoplay = true;
        myVid.srcObject = myStream;
        myVid.volume = 0;
        myVid.style.width = "200px";
        myVid.style.height = "150px";
        document.body.appendChild(myVid);

        peer.on("call", (call) => {
          callConnection[call.peer] = call;
          call.answer(myStream);
          call.peerConnection.ontrack = handleTrack(call.peer);
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
            <AspectRatio position="relative" w="full" ratio={16 / 9}>
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
        <Button
          colorScheme={isSoundEnabled ? undefined : "red"}
          onClick={handleMute}
        >
          {isSoundEnabled ? "Mute" : "Unmute"}
        </Button>
        <Button
          colorScheme={isCamEnabled ? undefined : "red"}
          onClick={handleCam}
        >
          {isCamEnabled ? "Cam Off" : "Cam On"}
        </Button>
        <Button onClick={handleShareAudio}>Share Audio</Button>
      </HStack>
    </Box>
  );
};

export default Call;
