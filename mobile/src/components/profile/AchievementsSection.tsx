import { View, Text, ScrollView } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
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
            border: isLight ? "rgba(245, 158, 11, 0.3)" : "rgba(245, 158, 11, 0.4)",
            text: isLight ? "#F59E0B" : "#fbbf24",
            bgSolid: isLight ? "#F59E0B" : "#fbbf24"
         };
      case "DIVERSITY":
         return {
            bg: isLight ? "rgba(6, 182, 212, 0.15)" : "rgba(34, 211, 238, 0.2)",
            border: isLight ? "rgba(6, 182, 212, 0.3)" : "rgba(34, 211, 238, 0.4)",
            text: isLight ? "#06B6D4" : "#22d3ee",
            bgSolid: isLight ? "#06B6D4" : "#22d3ee"
         };
      case "GOALS":
         return {
            bg: isLight ? "rgba(236, 72, 153, 0.15)" : "rgba(244, 114, 182, 0.2)",
            border: isLight ? "rgba(236, 72, 153, 0.3)" : "rgba(244, 114, 182, 0.4)",
            text: isLight ? "#EC4899" : "#f472b6",
            bgSolid: isLight ? "#EC4899" : "#f472b6"
         };
      case "VOLUME":
      default:
         return {
            bg: isLight ? "rgba(99, 102, 241, 0.15)" : "rgba(129, 140, 248, 0.2)",
            border: isLight ? "rgba(99, 102, 241, 0.3)" : "rgba(129, 140, 248, 0.4)",
            text: isLight ? "#6366F1" : "#818CF8",
            bgSolid: isLight ? "#6366F1" : "#818CF8" // Based on violet palette in tailwind.config
         };
   }
}

const CATEGORY_ICONS: Record<string, string> = {
  VOLUME: "📚",
  VELOCITY: "⚡",
  DIVERSITY: "🌍",
  GOALS: "🎯",
};

interface BadgeProps {
  achievement: AchievementDTO;
  isLight: boolean;
}

function Badge({ achievement, isLight }: BadgeProps) {
  const styles = getCategoryColors(achievement.category, isLight);
  const earned = achievement.earned;

  return (
    <View style={{ width: 96, alignItems: "center", marginRight: 12, opacity: earned ? 1 : 0.45 }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 2,
          backgroundColor: earned ? styles.bg : isLight ? "#ede9fe" : "#1E293B",
          borderColor: earned ? styles.border : isLight ? "#e2e8f0" : "#334155",
          ...(earned && {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }),
        }}
      >
        <Text style={{ fontSize: 30 }}>
          {CATEGORY_ICONS[achievement.category] ?? "🏆"}
        </Text>
      </View>
      
      {/* Progress for unearned */}
      {!earned && achievement.progress !== null ? (
        <View style={{ marginTop: 8, width: 64, height: 4, borderRadius: 2, overflow: "hidden", backgroundColor: isLight ? "#e2e8f0" : "#334155" }}>
          <View
            style={{
              height: "100%",
              borderRadius: 2,
              backgroundColor: styles.bgSolid,
              width: `${Math.round((achievement.progress || 0) * 100)}%`
            }}
          />
        </View>
      ) : null}

      <Text
        style={{
          marginTop: 8,
          fontSize: 11,
          fontWeight: "700",
          textAlign: "center",
          lineHeight: 15,
          color: earned ? (isLight ? "#111c2d" : "#F8FAFC") : (isLight ? "#494454" : "#94A3B8")
        }}
        numberOfLines={2}
      >
        {achievement.name}
      </Text>
      
      {!earned && achievement.progressLabel ? (
        <Text style={{ fontSize: 9, fontWeight: "600", marginTop: 2, textAlign: "center", color: styles.text }}>
          {achievement.progressLabel}
        </Text>
      ) : null}
    </View>
  );
}

export function AchievementsSection({ achievements }: Props) {
  const { mode } = useAppTheme();
  const isLight = mode === 'light';
  
  const earned = (achievements || []).filter((a) => a.earned);
  const unearned = (achievements || []).filter((a) => !a.earned);
  const earnedCount = earned.length;
  const totalCount = (achievements || []).length;

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(150)}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Text style={{ fontSize: 17, fontWeight: "800", letterSpacing: -0.3, color: isLight ? "#111c2d" : "#F8FAFC" }}>
          🏆 Achievements
        </Text>
        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: isLight ? "rgba(236, 72, 153, 0.15)" : "rgba(244, 114, 182, 0.2)" }}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: isLight ? "#EC4899" : "#f472b6" }}>
            {earnedCount}/{totalCount}
          </Text>
        </View>
      </View>

      {/* Earned row */}
      {earned.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, color: isLight ? "#494454" : "#94A3B8" }}>
            Earned
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {earned.map((a) => (
              <Badge key={a.code} achievement={a} isLight={isLight} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* In progress row */}
      {unearned.length > 0 && (
        <View>
          <Text style={{ fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, color: isLight ? "#494454" : "#94A3B8" }}>
            In Progress
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {unearned.slice(0, 8).map((a) => (
              <Badge key={a.code} achievement={a} isLight={isLight} />
            ))}
          </ScrollView>
        </View>
      )}
    </Animated.View>
  );
}
