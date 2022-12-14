import { useRef, useEffect } from "react";
import { Box } from "@chakra-ui/react";

type Props = {
  stream: MediaStream;
  isMuted?: boolean;
};

const Stream = (props: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = props.stream;
      videoRef.current.autoplay = true;
      videoRef.current.playsInline = true;
      if (props.isMuted) {
        videoRef.current.volume = 0;
      }
    }
  });

  return (
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
  );
};

export default Stream;
