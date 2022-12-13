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
