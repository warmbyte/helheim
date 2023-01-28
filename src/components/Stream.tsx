import { useRef, useEffect, MouseEventHandler } from "react";
import { Box, Text } from "@chakra-ui/react";
import { getSetting, createAudioVisualizer, getNameFromId } from "lib";

type Props = {
  stream: MediaStream;
  peerId: string;
  isMuted?: boolean;
};

const Stream = (props: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvas2Ref = useRef<HTMLCanvasElement>(null);
  const canvasInitiated = useRef(false);

  const handleDoubleClick: MouseEventHandler<HTMLInputElement> = (e) => {
    if (videoRef.current && canvasRef.current) {
      videoRef.current.requestFullscreen();
    }
  };

  useEffect(() => {
    if (videoRef.current && canvasRef.current) {
      if (!canvasInitiated.current) {
        canvasInitiated.current = true;
        if (!props.isMuted) {
          const tracks = props.stream.getAudioTracks();
          tracks.forEach((track, idx) => {
            const audio = document.createElement("audio");
            audio.autoplay = true;
            const stream = new MediaStream([track]);
            audio.srcObject = stream;
            const { audioOutputDeviceId } = getSetting();
            if ((audio as any).setSinkId) {
              (audio as any).setSinkId(audioOutputDeviceId);
            }
            if (idx === 0) {
              createAudioVisualizer(stream, canvasRef.current!);
            } else {
              createAudioVisualizer(stream, canvas2Ref.current!);
            }
            document.body.appendChild(audio);

            canvasRef.current!.width = videoRef.current!.clientWidth;
            canvasRef.current!.height = videoRef.current!.clientHeight;
            canvas2Ref.current!.width = videoRef.current!.clientWidth;
            canvas2Ref.current!.height = videoRef.current!.clientHeight;
          });
        }
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
    <div onDoubleClick={handleDoubleClick}>
      <Text
        color="white"
        fontWeight="bold"
        textTransform="capitalize"
        position="absolute"
        zIndex="3"
        top="4"
        left="4"
      >
        {getNameFromId(props.peerId)}
      </Text>
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
        pointerEvents="none"
      />
      <Box
        ref={canvas2Ref as any}
        zIndex={2}
        as="canvas"
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        overflow="hidden"
        borderRadius="lg"
        pointerEvents="none"
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
      />
    </div>
  );
};

export default Stream;
