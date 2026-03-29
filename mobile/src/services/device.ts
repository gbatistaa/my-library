import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

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

/** Human-readable device name sent to the server. */
export function getDeviceName(): string {
  const os =
    Platform.OS === "ios"
      ? "iOS"
      : Platform.OS === "android"
        ? "Android"
        : "Web";
  return `MyLibrary on ${os}`;
}
