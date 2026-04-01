import { View, Text, ScrollView } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import type { AchievementDTO } from "@/src/types/profile";

interface Props {
  achievements: AchievementDTO[] | undefined;
}

function Badge({
  achievement,
  colors,
}: {
  achievement: AchievementDTO;
  colors: any;
}) {
  const earned = achievement.earned;

  return (
    <View
      style={{
        width: 72,
        alignItems: "center",
        marginRight: 14,
        opacity: earned ? 1 : 0.4,
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: earned
            ? colors.primary + "15"
            : colors.border + "80",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1.5,
          borderColor: earned ? colors.primary + "40" : colors.border,
        }}
      >
        <Text style={{ fontSize: 20 }}>
          {earned ? getIcon(achievement.category) : "?"}
        </Text>
      </View>
      <Text
        style={{
          marginTop: 6,
          fontSize: 10,
          fontWeight: earned ? "600" : "500",
          color: earned ? colors.text : colors.textSecondary,
          textAlign: "center",
          lineHeight: 13,
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
  const { colors } = useAppTheme();

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
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 14,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: "600",
            color: colors.textSecondary,
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          Achievements
        </Text>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "500",
            color: colors.textSecondary,
          }}
        >
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
          <Badge key={a.code} achievement={a} colors={colors} />
        ))}
        {inProgress.map((a) => (
          <Badge key={a.code} achievement={a} colors={colors} />
        ))}
      </ScrollView>
    </Animated.View>
  );
}
