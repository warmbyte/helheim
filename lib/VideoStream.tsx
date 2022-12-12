import { useRef } from "react";
import { Box } from "@chakra-ui/react";
import { useMount } from "react-use";

export const VideoComponent = (props: {
  stream: MediaStream;
  isMuted?: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useMount(() => {
    videoRef.current!.srcObject = props.stream;
    if (props.isMuted) {
      videoRef.current!.volume = 0;
    }
  });

  return (
    <Box
      ref={videoRef as any}
      bg="gray.800"
      position="absolute"
      width="100%"
      height="100%"
      as="video"
      autoPlay={true}
      playsInline={true}
      id={props.stream?.id}
    />
  );
};

class VideoStream {
  stream: MediaStream;
  constructor(stream: MediaStream) {
    this.stream = stream;
  }

  camOff() {
    this.stream.getVideoTracks().forEach((track) => {
      track.enabled = false;
    });
  }

  camOn() {
    this.stream.getVideoTracks().forEach((track) => {
      track.enabled = true;
    });
  }

  mute() {
    this.stream.getAudioTracks().forEach((track) => {
      track.enabled = false;
    });
  }

  unmute() {
    this.stream.getAudioTracks().forEach((track) => {
      track.enabled = true;
    });
  }

  getStream() {
    return this.stream;
  }

  render(isMuted?: boolean) {
    return <VideoComponent isMuted={isMuted} stream={this.stream} />;
  }
}

export default VideoStream;
