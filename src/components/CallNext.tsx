import {
  Box,
  Grid,
  HStack,
  Button,
  GridItem,
  Spinner,
  Heading,
  IconButton,
  Tooltip,
  Icon,
} from "@chakra-ui/react";
import {
  BsMicMute,
  BsMic,
  BsCameraVideoOff,
  BsCameraVideo,
} from "react-icons/bs";
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
      bg="gray.900"
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
            <Icon
              as={BsMicMute}
              color="red"
              w={5}
              h={5}
              position="absolute"
              zIndex={2}
              display={isMuted ? "none" : "block"}
              bottom="2rem"
              right="2rem"
            />
            <Stream isMuted={item.isSelf} stream={item.stream} />
          </GridItem>
        ))}
      </Grid>
      <Box w="full" pt="4">
        <HStack justify="center">
          <Tooltip label={isCameraOn ? "Turn off camera" : "Turn on camera"}>
            <IconButton
              aria-label="camera-button"
              rounded="full"
              colorScheme={isCameraOn ? "green" : "red"}
              icon={isCameraOn ? <BsCameraVideo /> : <BsCameraVideoOff />}
              onClick={toggleCamera}
            />
          </Tooltip>

          <Tooltip label={isMuted ? "Mute" : "Unmute"}>
            <IconButton
              aria-label="mic-button"
              colorScheme={isMuted ? "green" : "red"}
              icon={isMuted ? <BsMic /> : <BsMicMute />}
              onClick={toggleMic}
              rounded="full"
            />
          </Tooltip>

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
