import { getSetting } from "lib";

let audioStream: MediaStream = null as any;
let faceStream: MediaStream = null as any;

export const createNilAudioTrack = () => {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const stream = ctx.createMediaStreamDestination();
  oscillator.connect(stream);
  oscillator.start();
  const audioTrack = stream.stream.getAudioTracks()[0];
  audioTrack.enabled = false;
  return audioTrack;
};

export const createNilVideoTrack = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  canvas.getContext("2d")!.fillRect(0, 0, 640, 480);
  const stream = canvas.captureStream();
  stream.getVideoTracks()[0].enabled = false;
  return stream.getVideoTracks()[0];
};

export class MyStream {
  stream: MediaStream;

  constructor(audio1: MediaStreamTrack, video: MediaStreamTrack) {
    const audio2 = createNilAudioTrack();
    this.stream = new MediaStream([audio1, audio2, video]);
  }

  toggleCamera = async () => {
    if (!this.stream.getVideoTracks()[0].enabled) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      const [, video] = stream.getTracks();
      this.stream.removeTrack(this.stream.getVideoTracks()[0]);
      this.stream.addTrack(video);
    } else {
      this.stream.getVideoTracks()[0].enabled = false;
      setTimeout(() => {
        this.stream.getVideoTracks()[0].stop();
      }, 100);
    }
  };

  toggleMic = async () => {
    this.stream.getAudioTracks()[0].enabled =
      !this.stream.getAudioTracks()[0].enabled;
  };

  stopAudio = async () => {
    if (audioStream) {
      audioStream.getTracks().forEach((track) => {
        track.stop();
        audioStream.removeTrack(track);
      });
    }
  };

  shareAudio = async (cb: () => void) => {
    audioStream = await navigator.mediaDevices.getDisplayMedia({
      audio: {
        sampleSize: 24,
        sampleRate: 48000,
        channelCount: 2,
        noiseSuppression: false,
        echoCancellation: false,
        autoGainControl: false,
        suppressLocalAudioPlayback: false,
      },
    });
    if (!audioStream.getAudioTracks()[0]) {
      audioStream.getTracks().forEach((track) => {
        track.stop();
        audioStream.removeTrack(track);
      });
      throw {};
    }
    audioStream.getAudioTracks()[0].onended = cb;
    const { audioInputDeviceId } = getSetting();
    const userAudio = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: {
        deviceId: audioInputDeviceId,
        noiseSuppression: true,
        echoCancellation: true,
        autoGainControl: true,
        suppressLocalAudioPlayback: true,
      },
    });
    userAudio.getAudioTracks()[0].enabled =
      this.stream.getAudioTracks()[0].enabled;
    this.stream.getAudioTracks().forEach((track) => {
      this.stream.removeTrack(track);
    });
    this.stream.addTrack(userAudio.getAudioTracks()[0]);
    this.stream.addTrack(audioStream.getAudioTracks()[0]);
  };

  startShareScreen = async (cb: () => void) => {
    faceStream = await navigator.mediaDevices.getDisplayMedia({
      audio: false,
      video: {
        frameRate: 60,
      },
    });

    faceStream.getTracks().forEach((track) => {
      track.onended = cb;
    });

    this.stream.removeTrack(this.stream.getVideoTracks()[0]);
    this.stream.addTrack(faceStream.getVideoTracks()[0]);
  };

  stopShareScreen = async () => {
    this.stream.removeTrack(this.stream.getVideoTracks()[0]);
    this.stream.addTrack(createNilVideoTrack());

    faceStream.getTracks().forEach((track) => {
      track.stop();
      faceStream.removeTrack(track);
    });
  };

  changeDevice = async () => {
    try {
      const videoTrack =
        this.stream.getVideoTracks()[0] ?? createNilVideoTrack();
      const [audioTrack, musicTrack] = this.stream.getAudioTracks();
      const { audioInputDeviceId, videoInputDeviceId, audioOutputDeviceId } =
        getSetting();

      document.querySelectorAll("audio").forEach((audio) => {
        if ((audio as any).setSinkId) {
          (audio as any).setSinkId(audioOutputDeviceId);
        }
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoTrack.enabled
          ? {
              deviceId: videoInputDeviceId,
            }
          : false,
        audio: {
          deviceId: audioInputDeviceId,
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
          suppressLocalAudioPlayback: true,
        },
      });
      stream.getAudioTracks()[0].enabled = audioTrack.enabled;
      const videoTrackReplacement = stream.getVideoTracks()[0] ?? videoTrack;

      const newStream = new MediaStream([
        stream.getAudioTracks()[0],
        musicTrack,
        videoTrackReplacement,
      ]);
      this.stream = newStream;
    } catch (error) {
      console.log(error);
    }
  };

  static create = async () => {
    const { audioInputDeviceId } = getSetting();
    const stream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: {
        deviceId: audioInputDeviceId,
        noiseSuppression: true,
        echoCancellation: true,
        autoGainControl: true,
        suppressLocalAudioPlayback: true,
      },
    });

    return new MyStream(stream.getAudioTracks()[0], createNilVideoTrack());
  };
}
