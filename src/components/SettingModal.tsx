import { useState } from "react";
import { create, useModal } from "@ebay/nice-modal-react";
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  ModalFooter,
  ModalOverlay,
  Button,
  Select,
  FormControl,
  FormLabel,
  Stack,
  Input,
  FormHelperText,
} from "@chakra-ui/react";
import {
  getAudioInputDeviceList,
  getAudioOutputDeviceList,
  getVideoInputDeviceList,
  getSetting,
  setSetting,
  EE,
} from "lib";
import { useAsync, useMount } from "hooks";

export const SettingModal = create(() => {
  const modal = useModal();
  const audioInputList = useAsync(getAudioInputDeviceList);
  const audioOutputList = useAsync(getAudioOutputDeviceList);
  const videoInputList = useAsync(getVideoInputDeviceList);
  const [state, setState] = useState<{
    audioInputDeviceId?: string;
    audioOutputDeviceId?: string;
    videoInputDeviceId?: string;
    preferredName?: string;
  }>(getSetting());

  useMount(() => {
    audioInputList.exec();
    audioOutputList.exec();
    videoInputList.exec();
  });

  const handleSave = () => {
    setSetting(state);
    EE.emit("change_device");
    modal.hide();
  };

  return (
    <Modal isOpen={modal.visible} onClose={modal.hide}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Setting</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack>
            <FormControl>
              <FormLabel>Microphone</FormLabel>
              <Select
                onChange={(e) => {
                  setState((prev) => ({
                    ...prev,
                    audioInputDeviceId: e.target.value,
                  }));
                }}
                value={state.audioInputDeviceId}
              >
                {(audioInputList.data ?? []).map((item) => (
                  <option key={item.deviceId} value={item.deviceId}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Speaker</FormLabel>
              <Select
                value={state.audioOutputDeviceId}
                onChange={(e) => {
                  setState((prev) => ({
                    ...prev,
                    audioOutputDeviceId: e.target.value,
                  }));
                }}
              >
                {(audioOutputList.data ?? []).map((item) => (
                  <option key={item.deviceId} value={item.deviceId}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Camera</FormLabel>
              <Select
                value={state.videoInputDeviceId}
                onChange={(e) => {
                  setState((prev) => ({
                    ...prev,
                    videoInputDeviceId: e.target.value,
                  }));
                }}
              >
                {(videoInputList.data ?? []).map((item) => (
                  <option key={item.deviceId} value={item.deviceId}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Preferred Name</FormLabel>
              <Input
                value={state.preferredName}
                placeholder="Leave blank to generate a random name"
                onChange={(e) => {
                  setState((prev) => ({
                    ...prev,
                    preferredName: e.target.value,
                  }));
                }}
              />
              <FormHelperText>Name changes requires rejoin</FormHelperText>
            </FormControl>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="green" onClick={handleSave}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});
