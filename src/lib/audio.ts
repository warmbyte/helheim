export const createAudioAnalyser = (audio: any) => {
  // @ts-ignore
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let audioSource = null;
  let analyser = null;

  audioSource = audioCtx.createMediaElementSource(audio);
  analyser = audioCtx.createAnalyser();
  audioSource.connect(analyser);
  analyser.connect(audioCtx.destination);
  return analyser;
};

export const createAudioVisualizer = (
  audio: HTMLAudioElement,
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
