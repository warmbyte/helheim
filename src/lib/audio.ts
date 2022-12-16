export const createAudioAnalyser = (audio: MediaStream) => {
  const audioCtx = new window.AudioContext({ sampleRate: 48000 });
  const analyser = audioCtx.createAnalyser();
  const audioSource = audioCtx.createMediaStreamSource(audio);
  audioSource.connect(analyser);
  analyser.connect(audioCtx.destination);

  return analyser;
};

export const createAudioVisualizer = (
  audio: MediaStream,
  canvas: HTMLCanvasElement
) => {
  const analyser = createAudioAnalyser(audio);
  analyser.fftSize = 1024;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  const barWidth = canvas.width / bufferLength;

  let barHeight = 0;
  let x = 0;
  function animate() {
    const ctx = canvas.getContext("2d")!;
    x = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    analyser.getByteFrequencyData(dataArray);
    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i];
      const red = (i * barHeight) / 10;
      const green = i * 4;
      const blue = barHeight / 4 - 12;
      ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
      ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight);
      x += barWidth;
    }

    requestAnimationFrame(animate);
  }

  animate();
};

export const playCall = () => {
  const audio = new Audio();
  audio.src = "/call.wav";
  audio.play();
};

export const playMessage = () => {
  const audio = new Audio();
  audio.src = "/message.wav";
  audio.play();
};
