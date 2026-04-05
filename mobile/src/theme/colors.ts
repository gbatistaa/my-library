export const colors = {
  light: {
    // Surfaces (tonal layering per design system)
    background: "#f9f9ff",
    surface: "#ffffff",
    surfaceContainerLow: "#f0f3ff",
    surfaceContainerHigh: "#dee8ff",
    surfaceContainer: "#e7eeff",

    // Text
    text: "#111c2d",
    textSecondary: "#494454",

    // Primary palette
    primary: "#6b38d4",
    primaryContainer: "#8455ef",
    primaryFixed: "#e9ddff",
    onPrimary: "#ffffff",
    onPrimaryFixedVariant: "#5516be",

    // Borders
    border: "#E2E8F0",
    outlineVariant: "#cbc3d7",
    outline: "#7b7486",

    // Tab bar
    tabBar: "#ffffff",
    tabBarInactive: "#94A3B8",

    // Semantic
    error: "#ba1a1a",
    errorContainer: "#ffdad6",
    success: "#10B981",

    // Gamification accents
    secondary: "#855300",
    secondaryContainer: "#fea619",
    secondaryFixed: "#ffddb8",
    tertiary: "#4f46e5",
    tertiaryContainer: "#6366f1",
    tertiaryFixed: "#e0e7ff",

    // Icon tints
    violet100: "#ede9fe",
    orange100: "#ffedd5",
    pink100: "#fce7f3",
    blue100: "#dbeafe",
    green100: "#dcfce7",
    blue600: "#2563eb",
    green700: "#15803d",
  },
  dark: {
    // Surfaces
    background: "#0F172A",
    surface: "#1E293B",
    surfaceContainerLow: "#1E293B",
    surfaceContainerHigh: "#334155",
    surfaceContainer: "#1E293B",

    // Text
    text: "#F8FAFC",
    textSecondary: "#94A3B8",

    // Primary palette
    primary: "#A78BFA",
    primaryContainer: "#A78BFA",
    primaryFixed: "#334155",
    onPrimary: "#0F172A",
    onPrimaryFixedVariant: "#A78BFA",

    // Borders
    border: "#334155",
    outlineVariant: "#334155",
    outline: "#475569",

    // Tab bar
    tabBar: "#1E293B",
    tabBarInactive: "#64748B",

    // Semantic
    error: "#F87171",
    errorContainer: "#450a0a",
    success: "#34D399",

    // Gamification accents
    secondary: "#F59E0B",
    secondaryContainer: "#fea619",
    secondaryFixed: "#1e293b",
    tertiary: "#818cf8",
    tertiaryContainer: "#6366f1",
    tertiaryFixed: "#e0e7ff",

    // Icon tints (dark mode variants)
    violet100: "rgba(167, 139, 250, 0.2)",
    orange100: "rgba(245, 158, 11, 0.2)",
    pink100: "rgba(236, 72, 153, 0.2)",
    blue100: "rgba(59, 130, 246, 0.2)",
    green100: "rgba(16, 185, 129, 0.2)",
    blue600: "#60a5fa",
    green700: "#4ade80",
  },
  // Shared gamification accents
  streak: "#F59E0B",
  achievement: "#EC4899",
  cyan: "#06B6D4",
} as const;

export type ThemeMode = "light" | "dark";
export type ThemeColors = (typeof colors)["light"] | (typeof colors)["dark"];
