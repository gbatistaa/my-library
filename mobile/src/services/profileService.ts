import { api } from "./api";
import type {
  StreakDTO,
  AchievementDTO,
  ReadingDnaDTO,
  ReadingGoalProgressDTO,
} from "@/src/types/profile";

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
    // No goal for this year — not an error
    return null;
  }
}
