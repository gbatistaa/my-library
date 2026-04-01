import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as Device from "expo-device";

const DEVICE_ID_KEY = "mylibrary_device_id";

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Returns a stable UUID for this device installation. Generated once, persisted. */
export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (existing) return existing;

  const newId = generateUUID();
  await SecureStore.setItemAsync(DEVICE_ID_KEY, newId);
  return newId;
}

export function getDeviceName(): string {
  const model = Device.modelName;
  const deviceName = Device.deviceName;
  const os =
    Platform.OS === "ios"
      ? "iOS"
      : Platform.OS === "android"
        ? "Android"
        : "Web";

  // If we have both, e.g., "Gabriel's iPhone (iPhone 16 Pro Max)"
  // Wait, user asked for "o nome deveria ser também o modelo como iphone 16 pro max"
  // So prioritize modelName, then fallback to deviceName
  if (model && deviceName && model !== deviceName) {
    return `${model} (${deviceName})`;
  } else if (model) {
    return model;
  } else if (deviceName) {
    return deviceName;
  }

  return `MyLibrary on ${os}`;
}
