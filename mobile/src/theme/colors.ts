export const colors = {
  light: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    text: '#1E293B',
    textSecondary: '#64748B',
    primary: '#6366F1',
    border: '#E2E8F0',
    tabBar: '#FFFFFF',
    tabBarInactive: '#94A3B8',
  },
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    primary: '#818CF8',
    border: '#334155',
    tabBar: '#1E293B',
    tabBarInactive: '#64748B',
  },
  // Shared gamification accents
  streak: '#F59E0B',
  achievement: '#EC4899',
  cyan: '#06B6D4',
} as const;

export type ThemeMode = 'light' | 'dark';
export type ThemeColors = (typeof colors)['light'] | (typeof colors)['dark'];
