import { useQuery } from '@tanstack/react-query';
import { api } from '@/src/services/api';
import type { UserDTO } from '@/src/types/auth';
import type {
  StreakDTO,
  AchievementDTO,
  ReadingDnaDTO,
  ReadingGoalProgressDTO,
} from '@/src/types/profile';

const CURRENT_YEAR = new Date().getFullYear();

export function useMe() {
  return useQuery<UserDTO>({
    queryKey: ['auth', 'me'],
    queryFn: () => api.get('/auth/me').then((r) => r.data),
  });
}

export function useStreak() {
  return useQuery<StreakDTO>({
    queryKey: ['streak'],
    queryFn: () => api.get('/streak').then((r) => r.data),
  });
}

export function useAchievements() {
  return useQuery<AchievementDTO[]>({
    queryKey: ['achievements'],
    queryFn: () => api.get('/achievements').then((r) => r.data),
  });
}

export function useRecentAchievements() {
  return useQuery<AchievementDTO[]>({
    queryKey: ['achievements', 'recent'],
    queryFn: () => api.get('/achievements/recent').then((r) => r.data),
  });
}

export function useReadingDna() {
  return useQuery<ReadingDnaDTO>({
    queryKey: ['stats', 'dna'],
    queryFn: () => api.get('/stats/dna').then((r) => r.data),
  });
}

export function useGoalProgress(year: number = CURRENT_YEAR) {
  return useQuery<ReadingGoalProgressDTO>({
    queryKey: ['reading-goals', year, 'progress'],
    queryFn: () => api.get(`/reading-goals/${year}/progress`).then((r) => r.data),
    retry: 1, // 404 if no goal set — don't keep retrying
  });
}
