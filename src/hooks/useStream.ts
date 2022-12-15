/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback } from "react";
import create from "zustand";
import Peer, { MediaConnection } from "peerjs";
import { io } from "socket.io-client";
import produce from "immer";
import { debounce } from "lodash";
import { MyStream, EE } from "lib";

interface IStore {
  streamList: { stream: MediaStream; peerId: string; isSelf?: boolean }[];
  callList: { call: MediaConnection; peerId: string }[];
  isScreenShared: boolean;
  isCameraOn: boolean;
  isMuted: boolean;
  isReady: boolean;
}

const useStore = create<IStore>(() => ({
  streamList: [],
  callList: [],
  isScreenShared: false,
  isCameraOn: false,
  isMuted: false,
  isReady: false,
}));
const { setState, getState } = useStore;

let myStream: MyStream = null as any;
const peer = new Peer();

const replaceTrack = () => {
  getState().callList.forEach(({ call }) => {
    const tracks = myStream.stream.getTracks();
    call.peerConnection.getSenders().forEach((sender, idx) => {
      sender.replaceTrack(tracks[idx]);
    });
  });
};

const handleAddTrack = (peerId: string) => (e: RTCTrackEvent) => {
  const nextState = produce(getState(), (draft) => {
    const index = draft.streamList.findIndex((item) => item.peerId === peerId);
    if (index === -1) {
      draft.streamList.push({ peerId, stream: e.streams[0] });
    } else {
      draft.streamList[index] = { peerId, stream: e.streams[0] };
    }
    if (draft.streamList.length - 1 === draft.callList.length) {
      draft.isReady = true;
    }
  });
  setState(nextState);
};

const handleStream = (peerId: string) => (stream: MediaStream) => {
  const nextState = produce(getState(), (draft) => {
    const index = draft.streamList.findIndex((item) => item.peerId === peerId);
    if (index === -1) {
      draft.streamList.push({ peerId, stream: stream });
    } else {
      draft.streamList[index] = { peerId, stream: stream };
    }
    if (draft.streamList.length >= 2 && draft.callList.length >= 1) {
      draft.isReady = true;
    }
  });
  setState(nextState);
};

const startCall = async (peerIdList: string[]) => {
  myStream = await MyStream.create();
  setState({
    streamList: [{ stream: myStream.stream, peerId: peer.id, isSelf: true }],
  });

  peer.on("call", (call) => {
    call.answer(myStream.stream);
    call.peerConnection.ontrack = handleAddTrack(call.peer);
    call.on("stream", handleStream(call.peer));
    setState(
      produce(getState(), (draft) => {
        draft.callList.push({ peerId: call.peer, call });
      })
    );
  });

  peerIdList = peerIdList.filter((item) => item !== peer.id);
  if (peerIdList.length === 0) setState({ isReady: true });
  peerIdList.forEach((peerId) => {
    const call = peer.call(peerId, myStream.stream);
    call.on("stream", handleStream(peerId));
    call.peerConnection.ontrack = handleAddTrack(peerId);

    const nextState = produce(getState(), (draft) => {
      draft.callList.push({ call, peerId });
    });
    setState(nextState);
  });
};

const handleMemberLeave = (peerId: string) => {
  const nextState = produce(getState(), (draft) => {
    draft.callList = draft.callList.filter((item) => item.peerId !== peerId);
    draft.streamList = draft.streamList.filter(
      (item) => item.peerId !== peerId
    );
  });
  setState(nextState);
};

const init = async () => {
  await fetch("/api/socket");
  const socket = io({ autoConnect: true, transports: ["websocket"] });

  socket.emit("join_call", peer.id);
  socket.on("member_list", startCall);
  socket.on("member_leave", handleMemberLeave);
};

peer.on("open", init);
EE.on("change_device", () => {
  myStream.changeDevice();
  replaceTrack();
});

export const useStream = () => {
  const state = useStore();

  const toggleCamera = useCallback(
    debounce(async () => {
      await myStream.toggleCamera();
      replaceTrack();
      setState((prev) => ({ isCameraOn: !prev.isCameraOn }));
    }, 500),
    []
  );

  const toggleMic = async () => {
    await myStream.toggleMic();
    setState((prev) => ({ isMuted: !prev.isMuted }));
  };

  const shareAudio = async () => {
    await myStream.shareAudio();
    replaceTrack();
  };

  const toggleShareScreen = async () => {
    const { isScreenShared } = getState();
    if (isScreenShared) {
      await myStream.stopShareScreen();
    } else {
      await myStream.startShareScreen();
    }
    replaceTrack();
    setState({ isScreenShared: !isScreenShared });
  };

  return { toggleCamera, toggleMic, shareAudio, toggleShareScreen, ...state };
};
