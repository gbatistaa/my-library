export const colors = {
  light: {
    background: "#F8F9FA",
    surface: "#FFFFFF",
    text: "#1E293B",
    textSecondary: "#64748B",
    primary: "#8B5CF6", // More vibrant purple/violet
    border: "#E2E8F0",
    tabBar: "#FFFFFF",
    tabBarInactive: "#94A3B8",
    error: "#EF4444",
    success: "#10B981",
  },
  dark: {
    background: "#0F172A",
    surface: "#1E293B",
    text: "#F8FAFC",
    textSecondary: "#94A3B8",
    primary: "#A78BFA", // Lighter purple/violet for dark mode
    border: "#334155",
    tabBar: "#1E293B",
    tabBarInactive: "#64748B",
    error: "#F87171",
    success: "#34D399",
  },
  // Shared gamification accents
  streak: "#F59E0B",
  achievement: "#EC4899",
  cyan: "#06B6D4",
} as const;

export type ThemeMode = "light" | "dark";
export type ThemeColors = (typeof colors)["light"] | (typeof colors)["dark"];
