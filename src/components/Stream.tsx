import { useRef, useEffect } from "react";
import { Box } from "@chakra-ui/react";
import { getSetting } from "lib";

type Props = {
  stream: MediaStream;
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
      document.body.appendChild(audio);

      const { audioOutputDeviceId } = getSetting();
      if ((audio as any).setSinkId) {
        (audio as any).setSinkId(audioOutputDeviceId);
      }

      videoRef.current.srcObject = props.stream;
      videoRef.current.volume = 0;
      videoRef.current.autoplay = true;
      videoRef.current.playsInline = true;
    }
  }, [props.stream, props.isMuted]);

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
