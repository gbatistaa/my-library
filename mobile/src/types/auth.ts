// ─── Backend DTO mirrors ────────────────────────────────────────────────────

/** Returned by GET /auth/me */
export interface UserDTO {
  id: string;
  username: string;
  email: string;
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
