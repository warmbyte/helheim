import { useRef } from "react";
import { Box } from "@chakra-ui/react";
import { useMount } from "react-use";

const Component = (props: { stream: MediaStream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useMount(() => {
    videoRef.current!.srcObject = props.stream;
    videoRef.current!.style.objectFit = "contain !important";
  });

  return (
    <Box
      ref={videoRef as any}
      bg="gray.500"
      position="absolute"
      width="100%"
      height="100%"
      as="video"
      autoPlay={true}
      playsInline={true}
      id={props.stream.id}
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

  render() {
    return <Component stream={this.stream} />;
  }
}

export default VideoStream;
