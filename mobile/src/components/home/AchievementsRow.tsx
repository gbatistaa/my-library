import { View, Text, ScrollView } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import type { AchievementDTO } from "@/src/types/profile";

interface Props {
  achievements: AchievementDTO[] | undefined;
}

function getCategoryColors(category: string, isLight: boolean) {
   switch (category) {
      case "VELOCITY":
         return {
            bg: isLight ? "rgba(245, 158, 11, 0.15)" : "rgba(245, 158, 11, 0.2)",
            border: isLight ? "rgba(245, 158, 11, 0.4)" : "rgba(245, 158, 11, 0.5)",
            text: isLight ? "#F59E0B" : "#fbbf24"
         };
      case "DIVERSITY":
         return {
            bg: isLight ? "rgba(6, 182, 212, 0.15)" : "rgba(34, 211, 238, 0.2)",
            border: isLight ? "rgba(6, 182, 212, 0.4)" : "rgba(34, 211, 238, 0.5)",
            text: isLight ? "#06B6D4" : "#22d3ee"
         };
      case "GOALS":
         return {
            bg: isLight ? "rgba(236, 72, 153, 0.15)" : "rgba(244, 114, 182, 0.2)",
            border: isLight ? "rgba(236, 72, 153, 0.4)" : "rgba(244, 114, 182, 0.5)",
            text: isLight ? "#EC4899" : "#f472b6"
         };
      case "VOLUME":
      default:
         return {
            bg: isLight ? "rgba(99, 102, 241, 0.15)" : "rgba(129, 140, 248, 0.2)",
            border: isLight ? "rgba(99, 102, 241, 0.4)" : "rgba(129, 140, 248, 0.5)",
            text: isLight ? "#6366F1" : "#818CF8" // Based on violet palette in tailwind.config
         };
   }
}

function Badge({ achievement, isLight }: { achievement: AchievementDTO, isLight: boolean }) {
  const earned = achievement.earned;
  const styles = getCategoryColors(achievement.category, isLight);

  return (
    <View style={{ width: 64, alignItems: "center", marginRight: 14, opacity: earned ? 1 : 0.4 }}>
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1.5,
          backgroundColor: earned ? styles.bg : isLight ? "#f0f3ff" : "#1E293B",
          borderColor: earned ? styles.border : isLight ? "#e2e8f0" : "#334155",
        }}
      >
        <Text style={{ fontSize: 20 }}>
          {earned ? getIcon(achievement.category) : "🏆"}
        </Text>
      </View>
      <Text
        style={{
          marginTop: 6,
          fontSize: 10,
          textAlign: "center",
          lineHeight: 13,
          fontWeight: earned ? "600" : "500",
          color: earned ? (isLight ? "#111c2d" : "#F8FAFC") : (isLight ? "#494454" : "#94A3B8"),
        }}
        numberOfLines={2}
      >
        {achievement.name}
      </Text>
    </View>
  );
}

function getIcon(category: string): string {
  switch (category) {
    case "VOLUME":
      return "\u{1F4DA}";
    case "VELOCITY":
      return "\u26A1";
    case "DIVERSITY":
      return "\u{1F30D}";
    case "GOALS":
      return "\u{1F3AF}";
    default:
      return "\u{1F3C6}";
  }
}

export function AchievementsRow({ achievements }: Props) {
  const { mode } = useAppTheme();
  const isLight = mode === 'light';

  if (!Array.isArray(achievements) || achievements.length === 0) {
    return null;
  }

  const earned = achievements.filter((a) => a.earned);
  const inProgress = achievements
    .filter((a) => !a.earned)
    .sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0));

  const earnedCount = earned.length;
  const totalCount = achievements.length;

  return (
    <Animated.View entering={FadeIn.duration(300).delay(250)}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
        <Text style={{ fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8, color: isLight ? "#494454" : "#94A3B8" }}>
          Achievements
        </Text>
        <Text style={{ fontSize: 13, fontWeight: "500", color: isLight ? "#494454" : "#94A3B8" }}>
          {earnedCount}/{totalCount}
        </Text>
      </View>

      {/* Horizontal scroll of badges */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {earned.map((a) => (
          <Badge key={a.code} achievement={a} isLight={isLight} />
        ))}
        {inProgress.map((a) => (
          <Badge key={a.code} achievement={a} isLight={isLight} />
        ))}
      </ScrollView>
    </Animated.View>
  );
}
