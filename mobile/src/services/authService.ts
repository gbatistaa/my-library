import {
  api,
  storeAccessToken,
  clearSession,
  getAccessToken,
  decodeJwtPayload,
  storeUserId,
} from "./api";
import { getOrCreateDeviceId, getDeviceName } from "./device";
import type { UserDTO } from "@/src/types/auth";

// ─── Auth Service — Pure async functions ─────────────────────────────────────

export interface LoginParams {
  username: string;
  password: string;
}

export interface RegisterParams {
  name: string;
  username: string;
  email: string;
  password: string;
  birthDate: string;
}

/**
 * POST /auth/login
 * Sends credentials + device info, stores the token, returns UserDTO.
 */
export async function login(params: LoginParams): Promise<UserDTO> {
  const deviceId = await getOrCreateDeviceId();
  const deviceName = getDeviceName();

  const { data } = await api.post<{ accessToken: string }>("/auth/login", {
    ...params,
    deviceId,
    deviceName,
  });

  await storeAccessToken(data.accessToken);

  const payload = decodeJwtPayload(data.accessToken);
  if (payload?.userId) {
    await storeUserId(payload.userId);
  }

  const { data: user } = await api.get<UserDTO>("/auth/me");
  return user;
}

/**
 * POST /auth/register
 * Creates account + stores token, returns UserDTO.
 */
export async function register(params: RegisterParams): Promise<UserDTO> {
  const deviceId = await getOrCreateDeviceId();
  const deviceName = getDeviceName();

  const body = {
    ...params,
    deviceId,
    deviceName,
  };

  const { data } = await api.post<{ accessToken: string }>(
    "/auth/register",
    body,
  );

  await storeAccessToken(data.accessToken);

  const payload = decodeJwtPayload(data.accessToken);
  if (payload?.userId) {
    await storeUserId(payload.userId);
  }

  const { data: user } = await api.get<UserDTO>("/auth/me");
  return user;
}

/**
 * GET /auth/me — fetch current user profile using stored token.
 */
export async function fetchMe(): Promise<UserDTO> {
  const { data } = await api.get<UserDTO>("/auth/me");
  return data;
}

/**
 * Hydrate session on app start.
 * Returns UserDTO if token exists and is valid, null otherwise.
 */
export async function hydrateSession(): Promise<UserDTO | null> {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    return await fetchMe();
  } catch {
    await clearSession();
    return null;
  }
}

/**
 * Logout — invalidate server-side token for this device + clear local state.
 */
export async function logout(): Promise<void> {
  const deviceId = await getOrCreateDeviceId();
  try {
    await api.delete(`/auth/logout?deviceId=${deviceId}`);
  } catch {
    // best-effort
  }
  await clearSession();
}
