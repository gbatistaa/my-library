// ─── Backend DTO mirrors ────────────────────────────────────────────────────

/** Returned by GET /auth/me */
export interface UserDTO {
  id: string;
  name: string;
  username: string;
  email: string;
  birthDate: string; // "yyyy-MM-dd"
  createdAt: string; // ISO LocalDateTime "yyyy-MM-ddTHH:mm:ss"
  profilePicPath: string | null;
  totalExperience: number;
  level: number;
}

/** Returned by POST /auth/login and /auth/register */
export interface AuthResponse {
  accessToken: string;
}

/** Used by POST /auth/refresh */
export interface RefreshRequest {
  userId: string;
  deviceId: string;
}

/** JWT payload claims (decoded client-side) */
export interface JwtPayload {
  sub: string;
  userId: string;
  iat: number;
  exp: number;
}

/** Returned by GET /auth/sessions/me */
export interface DeviceSessionDTO {
  id: string;
  deviceId: string;
  deviceName: string;
  expirationDate: string; // ISO instant
}
