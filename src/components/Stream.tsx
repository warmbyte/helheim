import { useRef, useEffect } from "react";
import { Box } from "@chakra-ui/react";

type Props = {
  stream: MediaStream;
  isCamEnabled?: boolean;
  isMuted?: boolean;
};

const Stream = (props: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const audio = (() => {
      if (document.getElementById(`audio-${props.stream.id}`))
        return document.getElementById(
          `audio-${props.stream.id}`
        )! as HTMLAudioElement;

      const aud = document.createElement("audio");
      aud.id = `audio-${props.stream.id}`;
      return aud;
    })();

    if (videoRef.current) {
      audio.autoplay = true;
      audio.muted = !!props.isMuted;
      audio.srcObject = new MediaStream(props.stream.getAudioTracks());
      videoRef.current.srcObject = new MediaStream(
        props.stream.getVideoTracks()
      );
      videoRef.current.autoplay = true;
      videoRef.current.playsInline = true;
    }
  }, [props.stream, props.isMuted, props.isCamEnabled]);

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
    />
  );
};

export default Stream;
