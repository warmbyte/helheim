import {
  Box,
  Grid,
  HStack,
  GridItem,
  Spinner,
  Heading,
  IconButton,
  Tooltip,
  Flex,
  Text,
} from "@chakra-ui/react";
import {
  BsMicMute,
  BsMic,
  BsCameraVideoOff,
  BsCameraVideo,
  BsChat,
} from "react-icons/bs";
import {
  MdMusicNote,
  MdMusicOff,
  MdScreenShare,
  MdStopScreenShare,
  MdOutlineSettings,
} from "react-icons/md";
import { useModal } from "@ebay/nice-modal-react";
import { useCallLayout, useStream, useStreamStore } from "hooks";
import Stream from "components/Stream";
import { SettingModal } from "components/SettingModal";
import Chat from "components/Chat";

const CallNext = (props: { room: string }) => {
  const {
    streamList,
    callList,
    isReady,
    isCameraOn,
    isMuted,
    unreadedChat,
    isShowChat,
    isScreenShared,
    isAudioShared,
    toggleAudio,
    toggleMic,
    toggleCamera,
    toggleShareScreen,
  } = useStream(props.room);
  const establishingPeerCount = Math.abs(
    streamList.length - 1 - callList.length
  );
  const settingModal = useModal(SettingModal);

  const { columns, rows } = useCallLayout(streamList.length);

  const toggleChat = () => {
    if (!isShowChat) {
      useStreamStore.setState({ isShowChat: true, unreadedChat: 0 });
    } else {
      useStreamStore.setState({ isShowChat: false });
    }
  };

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
    <Flex flexDirection="row">
      <Box
        p="4"
        display="flex"
        flexDir="column"
        position="relative"
        overflow="hidden"
        bg="gray.900"
        flex="1"
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
              <Stream
                peerId={item.peerId}
                isMuted={item.isSelf}
                stream={item.stream}
              />
            </GridItem>
          ))}
        </Grid>
        <Box display="flex" flexDirection="row" w="full" pt="4">
          <HStack flex="1" />
          <HStack flex="1" justify="center" spacing="4">
            <Tooltip label={isCameraOn ? "Turn off camera" : "Turn on camera"}>
              <IconButton
                aria-label="camera-button"
                rounded="full"
                colorScheme={isCameraOn ? "green" : "red"}
                icon={isCameraOn ? <BsCameraVideo /> : <BsCameraVideoOff />}
                onClick={toggleCamera}
              />
            </Tooltip>

            <Tooltip label={isMuted ? "Unmute" : "Mute"}>
              <IconButton
                aria-label="mic-button"
                colorScheme={isMuted ? "red" : "green"}
                icon={isMuted ? <BsMicMute /> : <BsMic />}
                onClick={toggleMic}
                rounded="full"
              />
            </Tooltip>

            <Tooltip label={isAudioShared ? "Stop Audio" : "Share Audio"}>
              <IconButton
                aria-label="audio-button"
                colorScheme={isAudioShared ? "green" : "red"}
                icon={isAudioShared ? <MdMusicOff /> : <MdMusicNote />}
                onClick={toggleAudio}
                rounded="full"
              />
            </Tooltip>
            <Tooltip
              label={isScreenShared ? "Stop Screen Share" : "Share Screen"}
            >
              <IconButton
                aria-label="screen-button"
                colorScheme={isScreenShared ? "green" : "red"}
                icon={
                  isScreenShared ? <MdStopScreenShare /> : <MdScreenShare />
                }
                onClick={toggleShareScreen}
                rounded="full"
              />
            </Tooltip>
            <Tooltip label="Settings">
              <IconButton
                aria-label="setting-button"
                icon={<MdOutlineSettings />}
                onClick={() => settingModal.show()}
                rounded="full"
              />
            </Tooltip>
          </HStack>
          <HStack justify="right" flex="1">
            <Box position="relative">
              {unreadedChat > 0 ? (
                <Box
                  zIndex="2"
                  position="absolute"
                  top="-2"
                  right="-1"
                  w="22px"
                  h="22px"
                  borderRadius="full"
                  bg="red.400"
                >
                  <Text
                    fontWeight="bold"
                    fontSize="xs"
                    textAlign="center"
                    color="white"
                  >
                    {unreadedChat > 99 ? "99" : unreadedChat}
                  </Text>
                </Box>
              ) : null}
              <IconButton
                aria-label="chat-button"
                icon={<BsChat />}
                onClick={toggleChat}
                rounded="full"
              />
            </Box>
          </HStack>
        </Box>
      </Box>
      {isShowChat ? <Chat /> : null}
    </Flex>
  );
};

export default CallNext;
