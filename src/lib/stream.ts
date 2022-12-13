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
  canvas.width = 300;
  canvas.height = 300;
  const stream = canvas.captureStream(30);
  stream.getVideoTracks()[0].enabled = false;
  return stream.getVideoTracks()[0];
};

export class MyStream {
  stream: MediaStream;

  constructor() {
    const audio1 = createNilAudioTrack();
    const audio2 = createNilAudioTrack();
    const video = createNilVideoTrack();
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
      this.stream.getVideoTracks()[0].stop();
    }
  };
}
