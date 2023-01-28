import { KeyboardEventHandler, useRef } from "react";
import { Box, Stack, Input, Text, Button } from "@chakra-ui/react";
import { useStreamStore } from "hooks";
import { EE, getNameFromId } from "lib";

const Chat = ({ toggleChat }: { toggleChat?: () => void }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { chat } = useStreamStore();

  const handleSendMessage: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.code === "Enter" && inputRef.current && inputRef.current.value) {
      EE.emit("input_chat", inputRef.current.value);
      inputRef.current.value = "";
    }
  };

  return (
    <Box display="flex" flexDirection="column" w="320px" h="100vh">
      {toggleChat && <Box p="4" display="flex" alignItems="center">
        <Text fontSize="sm" fontWeight="bold" flexGrow={1} />
        <Button onClick={toggleChat} size='xs'>
          Close
        </Button>
      </Box>}
      <Stack py="2" px="4" flex="1" overflowY="scroll">
        {chat.map((item, idx) => (
          <Box key={idx}>
            <Text
              color={item.isSelf ? "red.500" : "gray.500"}
              textTransform="capitalize"
              fontSize="xs"
              fontWeight="bold"
            >
              {item.isSelf ? "Me" : getNameFromId(item.peerId)}
            </Text>
            <Text fontSize="sm">{item.message}</Text>
          </Box>
        ))}
      </Stack>
      <Box p="4">
        <Input
          ref={inputRef}
          onKeyDown={handleSendMessage}
          placeholder="Enter your message"
        />
      </Box>
    </Box>
  );
};

export default Chat;
