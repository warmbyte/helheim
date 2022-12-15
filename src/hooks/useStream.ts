/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback } from "react";
import create from "zustand";
import Peer, { DataConnection, MediaConnection } from "peerjs";
import { io } from "socket.io-client";
import produce from "immer";
import { debounce } from "lodash";
import { MyStream, EE, getRandomId, playCall, playMessage } from "lib";

interface IStore {
  streamList: { stream: MediaStream; peerId: string; isSelf?: boolean }[];
  callList: { call: MediaConnection; peerId: string }[];
  connectionList: { connection: DataConnection; peerId: string }[];
  chat: { message: string; peerId: string; isSelf: boolean }[];
  unreadedChat: number;
  isShowChat: boolean;
  isScreenShared: boolean;
  isAudioShared: boolean;
  isCameraOn: boolean;
  isMuted: boolean;
  isReady: boolean;
}

export const useStreamStore = create<IStore>(() => ({
  streamList: [],
  callList: [],
  connectionList: [],
  chat: [],
  unreadedChat: 0,
  isShowChat: false,
  isScreenShared: false,
  isCameraOn: false,
  isMuted: false,
  isReady: false,
  isAudioShared: false,
}));
const { setState, getState } = useStreamStore;

let myStream: MyStream = null as any;
const peer = new Peer(getRandomId());

peer.on("connection", (connection) => {
  connection.on("data", dataHandler(connection.peer));
  setState(
    produce(getState(), (draft) => {
      draft.connectionList.push({ connection, peerId: connection.peer });
    })
  );
});

EE.on("input_chat", (message: string) => {
  getState().connectionList.forEach(({ connection }) => {
    connection.send({ type: "chat", message });
  });

  const nextState = produce(getState(), (draft) => {
    draft.chat.push({
      message: message as string,
      peerId: peer.id,
      isSelf: true,
    });
  });
  setState(nextState);
});

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
  });
  setState(nextState);
};

const dataHandler = (peerId: string) => (data: any) => {
  playMessage();
  if (data.type === "chat") {
    const nextState = produce(getState(), (draft) => {
      if (!draft.isShowChat) {
        draft.unreadedChat++;
      }

      draft.chat.push({
        message: data.message as string,
        peerId,
        isSelf: false,
      });
    });
    setState(nextState);
  }
};

const startCall = async (peerIdList: string[]) => {
  myStream = await MyStream.create();
  setState({
    streamList: [{ stream: myStream.stream, peerId: peer.id, isSelf: true }],
  });

  peer.on("call", (call) => {
    playCall();
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
  setState({ isReady: true });
  peerIdList.forEach((peerId) => {
    const call = peer.call(peerId, myStream.stream);
    const connection = peer.connect(peerId);
    connection.on("data", dataHandler(peerId));
    call.on("stream", handleStream(peerId));
    call.peerConnection.ontrack = handleAddTrack(peerId);

    const nextState = produce(getState(), (draft) => {
      draft.callList.push({ call, peerId });
      draft.connectionList.push({ connection, peerId });
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
  const socket = io({
    autoConnect: true,
    reconnection: true,
    transports: ["websocket"],
  });

  setInterval(() => {
    socket.emit("ping", peer.id);
  }, 1000 * 5);

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
  const state = useStreamStore();

  const toggleCamera = useCallback(
    debounce(async () => {
      if (getState().isCameraOn) {
        await myStream.stopCamera();
      } else {
        await myStream.startCamera(() => {
          setState({ isCameraOn: false });
        });
      }
      replaceTrack();
      setState((prev) => ({ isCameraOn: !prev.isCameraOn }));
    }, 500),
    []
  );

  const toggleMic = async () => {
    await myStream.toggleMic();
    setState((prev) => ({ isMuted: !prev.isMuted }));
  };

  const toggleAudio = async () => {
    try {
      if (getState().isAudioShared) {
        await myStream.stopAudio();
        setState({ isAudioShared: false });
      } else {
        await myStream.shareAudio(() => {
          setState({ isAudioShared: false });
        });
        replaceTrack();
        setState({ isAudioShared: true });
      }
    } catch (error) {}
  };

  const toggleShareScreen = async () => {
    const { isScreenShared } = getState();
    if (isScreenShared) {
      await myStream.stopShareScreen();
    } else {
      await myStream.startShareScreen(() => {
        setState({ isScreenShared: false });
      });
    }
    replaceTrack();
    setState({ isScreenShared: !isScreenShared });
  };

  return { toggleCamera, toggleMic, toggleAudio, toggleShareScreen, ...state };
};
