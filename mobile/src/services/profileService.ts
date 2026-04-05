import { api } from "./api";
import type {
  StreakDTO,
  AchievementDTO,
  ReadingDnaDTO,
  ReadingGoalDTO,
  ReadingGoalProgressDTO,
  BookAuthorDTO,
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

// ─── Reading Goal CRUD ────────────────────────────────────────────────────────

export async function listReadingGoals(): Promise<ReadingGoalDTO[]> {
  try {
    const { data } = await api.get<ReadingGoalDTO[]>("/reading-goals");
    return data ?? [];
  } catch {
    return [];
  }
}

export interface CreateGoalPayload {
  year: number;
  targetBooks: number;
  targetPages?: number;
  targetMinutes?: number;
  targetAuthors?: number;
  targetGenres?: number;
  visibility: "PUBLIC" | "PRIVATE";
}

export async function createReadingGoal(
  payload: CreateGoalPayload,
): Promise<ReadingGoalDTO> {
  const { data } = await api.post<ReadingGoalDTO>("/reading-goals", payload);
  return data;
}

export async function deleteReadingGoal(id: string): Promise<void> {
  await api.delete(`/reading-goals/${id}`);
}

export async function getBookAuthors(): Promise<BookAuthorDTO[]> {
  try {
    const { data } = await api.get<BookAuthorDTO[]>("/books/authors");
    return data ?? [];
  } catch {
    return [];
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
  profilePicPath?: string | null;
}): Promise<UserDTO> {
  const { data } = await api.patch<UserDTO>("/users/me", updates);
  return data;
}
