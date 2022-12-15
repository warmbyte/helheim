import {
  Box,
  Grid,
  HStack,
  Button,
  GridItem,
  Spinner,
  Heading,
} from "@chakra-ui/react";
import { useModal } from "@ebay/nice-modal-react";
import { useCallLayout, useStream } from "hooks";
import Stream from "components/Stream";
import { SettingModal } from "components/SettingModal";

const CallNext = () => {
  const {
    streamList,
    callList,
    isReady,
    isCameraOn,
    isMuted,
    isScreenShared,
    shareAudio,
    toggleMic,
    toggleCamera,
    toggleShareScreen,
  } = useStream();
  const establishingPeerCount = Math.abs(
    streamList.length - 1 - callList.length
  );
  const settingModal = useModal(SettingModal);

  const { columns, rows } = useCallLayout(streamList.length);

  if (!isReady)
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        w="100vw"
        h="100vh"
      >
        <Box textAlign="center">
          <Spinner size="xl" />
          {callList.length > 0 ? (
            <Heading mt="4">
              Establishing Connection to {establishingPeerCount} Peer
            </Heading>
          ) : (
            <Heading mt="4">Establishing Connection</Heading>
          )}
        </Box>
      </Box>
    );

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
            <Stream isMuted={item.isSelf} stream={item.stream} />
          </GridItem>
        ))}
      </Grid>
      <Box w="full" pt="4">
        <HStack justify="center">
          <Button
            colorScheme={isCameraOn ? "red" : "green"}
            onClick={toggleCamera}
          >
            {isCameraOn ? "Cam Off" : "Cam On"}
          </Button>
          <Button colorScheme={isMuted ? "green" : "red"} onClick={toggleMic}>
            {isMuted ? "Unmute" : "Mute"}
          </Button>
          <Button onClick={shareAudio}>Share Audio</Button>
          <Button
            colorScheme={isScreenShared ? "red" : "green"}
            onClick={toggleShareScreen}
          >
            {isScreenShared ? "Stop Share Screen" : "Share Screen"}
          </Button>
          <Button onClick={() => settingModal.show()}>Setting</Button>
        </HStack>
      </Box>
    </Box>
  );
};

export default CallNext;
