import { api } from "./api";
import type {
  StreakDTO,
  AchievementDTO,
  ReadingDnaDTO,
  ReadingGoalProgressDTO,
} from "@/src/types/profile";
import type { DeviceSessionDTO, UserDTO } from "@/src/types/auth";

// ─── Profile API calls ────────────────────────────────────────────────────────

export async function getStreak(): Promise<StreakDTO> {
  const { data } = await api.get<StreakDTO>("/streak");
  return data;
}

export async function getAchievements(): Promise<AchievementDTO[]> {
  const { data } = await api.get<AchievementDTO[]>("/achievements");
  return data;
}

export async function getRecentAchievements(): Promise<AchievementDTO[]> {
  const { data } = await api.get<AchievementDTO[]>("/achievements/recent");
  return data;
}

export async function getReadingDna(): Promise<ReadingDnaDTO> {
  const { data } = await api.get<ReadingDnaDTO>("/stats/dna");
  return data;
}

export async function getGoalProgress(
  year: number,
): Promise<ReadingGoalProgressDTO | null> {
  try {
    const { data } = await api.get<ReadingGoalProgressDTO>(
      `/reading-goals/${year}/progress`,
    );
    return data;
  } catch {
    return null;
  }
}

/** Fetch the current authenticated user's full profile (name, email, birthDate, createdAt). */
export async function fetchCurrentUser(): Promise<UserDTO> {
  const { data } = await api.get<UserDTO>("/auth/me");
  return data;
}

// ─── Devices & Profile ────────────────────────────────────────────────────────

export async function getMyDevices(): Promise<DeviceSessionDTO[]> {
  const { data } = await api.get<DeviceSessionDTO[]>("/auth/sessions/me");
  return data;
}

export async function revokeDevice(sessionId: string): Promise<void> {
  await api.delete(`/auth/sessions/${sessionId}`);
}

export async function updateProfile(updates: {
  name?: string;
  username?: string;
}): Promise<UserDTO> {
  const { data } = await api.patch<UserDTO>("/users/me", updates);
  return data;
}
