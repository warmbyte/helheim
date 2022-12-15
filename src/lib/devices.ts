export const getAudioInputDeviceList = async () => {
  const deviceList = await navigator.mediaDevices.enumerateDevices();
  return deviceList.filter((item) => item.kind === "audioinput");
};

export const getAudioOutputDeviceList = async () => {
  const deviceList = await navigator.mediaDevices.enumerateDevices();
  return deviceList.filter((item) => item.kind === "audiooutput");
};

export const getVideoInputDeviceList = async () => {
  const deviceList = await navigator.mediaDevices.enumerateDevices();
  return deviceList.filter((item) => item.kind === "videoinput");
};

export const setSetting = (setting: {
  audioInputDeviceId?: string;
  audioOutputDeviceId?: string;
  videoInputDeviceId?: string;
}) => {
  try {
    if (setting.audioInputDeviceId)
      localStorage.setItem("audioInputDeviceId", setting.audioInputDeviceId);
    if (setting.audioOutputDeviceId)
      localStorage.setItem("audioOutputDeviceId", setting.audioOutputDeviceId);
    if (setting.videoInputDeviceId)
      localStorage.setItem("videoInputDeviceId", setting.videoInputDeviceId);
  } catch (error) {}
};

export const getSetting = () => {
  try {
    return {
      audioInputDeviceId:
        localStorage.getItem("audioInputDeviceId") ?? undefined,
      audioOutputDeviceId:
        localStorage.getItem("audioOutputDeviceId") ?? undefined,
      videoInputDeviceId:
        localStorage.getItem("videoInputDeviceId") ?? undefined,
    };
  } catch (error) {
    return {
      audioInputDeviceId: undefined,
      audioOutputDeviceId: undefined,
      videoInputDeviceId: undefined,
    };
  }
};
