import { useState } from "react";
import { Box, Grid, HStack, Button, GridItem } from "@chakra-ui/react";
import { useMount } from "hooks";
import Stream from "components/Stream";
import { createNilAudioTrack, createNilVideoTrack } from "lib";

let myStream: MediaStream = null as any;

const CallNext = () => {
  const [streamList, setStreamList] = useState<MediaStream[]>([]);

  useMount(() => {
    const init = async () => {
      const audio1 = createNilAudioTrack();
      const audio2 = createNilAudioTrack();
      const video = createNilVideoTrack();
      myStream = new MediaStream([audio1, audio2, video]);

      myStream.onaddtrack = (e) => {
        console.log(e);
      };

      const _streamList = new Array(3).fill(null).map(() => {
        return myStream;
      });
      setStreamList(_streamList);
    };

    init();
  });

  const handleCam = async () => {
    if (!myStream.getVideoTracks()[0].enabled) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      const [, video] = stream.getTracks();
      myStream.removeTrack(myStream.getVideoTracks()[0]);
      myStream.addTrack(video);
    } else {
      myStream.getVideoTracks()[0].enabled = false;
      myStream.getVideoTracks()[0].stop();
    }
  };

  return (
    <Box
      p="4"
      display="flex"
      flexDir="column"
      position="relative"
      overflow="hidden"
      w="100vw"
      h="100vh"
    >
      <Grid
        w="full"
        flex="1"
        gridTemplateColumns={{ base: "repeat(1, 1fr)", lg: "repeat(3, 1fr)" }}
        gridTemplateRows="repeat(3, 1fr)"
        gridAutoRows={0}
        gap={4}
        overflowY="hidden"
      >
        {streamList.map((item, idx) => (
          <GridItem
            position="relative"
            key={idx}
            display={idx > 8 ? "none" : undefined}
          >
            <Stream isMuted stream={item} />
          </GridItem>
        ))}
      </Grid>
      <Box w="full" pt="4">
        <HStack justify="center">
          <Button onClick={handleCam}>Cam On</Button>
          <Button>Mute</Button>
          <Button>Share Audio</Button>
        </HStack>
      </Box>
    </Box>
  );
};

export default CallNext;
