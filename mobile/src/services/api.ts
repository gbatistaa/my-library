import { Platform } from "react-native";
import Constants from "expo-constants";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";

import type {
  AuthResponse,
  JwtPayload,
  RefreshRequest,
} from "@/src/types/auth";

const API_PORT = 8080;

/**
 * Resolves the backend URL automatically:
 * - Physical device (Expo Go): extracts dev machine IP from Expo's hostUri
 * - Android Emulator: 10.0.2.2 (loopback to host)
 * - iOS Simulator / Web: localhost
 */
function resolveBaseUrl(): string {
  // Expo exposes the dev server host as "192.168.x.x:8081" — extract the IP
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:${API_PORT}`;
  }

  // Fallback without Expo context
  if (Platform.OS === "android") return `http://10.0.2.2:${API_PORT}`;
  return `http://localhost:${API_PORT}`;
}

export const BASE_URL = resolveBaseUrl();

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "mylibrary_access_token",
  USER_ID: "mylibrary_user_id",
  DEVICE_ID: "mylibrary_device_id",
} as const;

// ─── Axios instance ───────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// ─── Token helpers ────────────────────────────────────────────────────────────

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
}

export async function storeAccessToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, token);
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_ID);
}

export async function storeUserId(userId: string): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEYS.USER_ID, userId);
}

export async function getStoredUserId(): Promise<string | null> {
  return SecureStore.getItemAsync(STORAGE_KEYS.USER_ID);
}

// ─── JWT decode (no external library needed) ─────────────────────────────────

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "==".slice(0, (4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}

// ─── Request interceptor: inject Bearer token ────────────────────────────────

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: silent refresh on 401 ─────────────────────────────

let refreshPromise: Promise<string | null> | null = null;

async function silentRefresh(): Promise<string | null> {
  const userId = await getStoredUserId();
  const deviceId = await SecureStore.getItemAsync(STORAGE_KEYS.DEVICE_ID);

  if (!userId || !deviceId) return null;

  try {
    const body: RefreshRequest = { userId, deviceId };
    // Raw axios call — bypasses our interceptors to avoid recursive loop
    const { data } = await axios.post<AuthResponse>(
      `${BASE_URL}/auth/refresh`,
      body,
    );
    await storeAccessToken(data.accessToken);
    return data.accessToken;
  } catch {
    await clearSession();
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !original?._retry) {
      original._retry = true;

      // Deduplicate concurrent 401s — all wait for the same refresh
      if (!refreshPromise) {
        refreshPromise = silentRefresh().finally(() => {
          refreshPromise = null;
        });
      }

      const newToken = await refreshPromise;
      if (newToken && original) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }

    return Promise.reject(error);
  },
);
