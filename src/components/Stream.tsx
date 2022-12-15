import { useRef, useEffect } from "react";
import { Box } from "@chakra-ui/react";
import { getSetting, createAudioVisualizer } from "lib";

type Props = {
  stream: MediaStream;
  isMuted?: boolean;
};

const Stream = (props: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasInitiated = useRef(false);

  useEffect(() => {
    if (videoRef.current && canvasRef.current) {
      if (!canvasInitiated.current) {
        canvasInitiated.current = true;
        if (!props.isMuted)
          props.stream.getAudioTracks().forEach((track) => {
            const audio = document.createElement("audio");
            audio.autoplay = true;
            audio.srcObject = new MediaStream([track]);
            const { audioOutputDeviceId } = getSetting();
            if ((audio as any).setSinkId) {
              (audio as any).setSinkId(audioOutputDeviceId);
            }
            document.body.appendChild(audio);

            canvasRef.current!.width = videoRef.current!.clientWidth;
            canvasRef.current!.height = videoRef.current!.clientHeight;
            createAudioVisualizer(audio, canvasRef.current!);
          });
      }

      videoRef.current.srcObject = new MediaStream(
        props.stream.getVideoTracks()
      );
      videoRef.current.volume = 0;
      videoRef.current.autoplay = true;
      videoRef.current.playsInline = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...props.stream.getTracks(), props.isMuted]);

  return (
    <>
      <Box
        ref={canvasRef as any}
        zIndex={2}
        as="canvas"
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        overflow="hidden"
        borderRadius="lg"
      />
      <Box
        ref={videoRef as any}
        borderRadius="lg"
        as="video"
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        overflow="hidden"
        bg="black"
        objectFit="contain"
        transform="scaleX(-1)"
      />
    </>
  );
};

export default Stream;
