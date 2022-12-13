import { useState } from "react";
import { Box, Grid, HStack, Button, GridItem } from "@chakra-ui/react";
import { useMount, useCallLayout } from "hooks";
import Stream from "components/Stream";
import { MyStream } from "lib";

const myStream = new MyStream();

const CallNext = () => {
  const [streamList, setStreamList] = useState<MediaStream[]>([]);

  useMount(() => {
    const init = async () => {
      const _streamList = new Array(2).fill(null).map(() => {
        return myStream.stream;
      });
      setStreamList(_streamList);
    };

    init();
  });

  const { columns, rows } = useCallLayout(streamList.length);

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
        gridTemplateColumns={columns}
        gridTemplateRows={rows}
        gap={4}
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
          <Button onClick={myStream.toggleCamera}>Cam On</Button>
          <Button>Mute</Button>
          <Button>Share Audio</Button>
        </HStack>
      </Box>
    </Box>
  );
};

export default CallNext;
