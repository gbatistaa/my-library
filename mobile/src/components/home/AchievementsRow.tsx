import { View, Text, ScrollView } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import type { AchievementDTO } from "@/src/types/profile";

interface Props {
  achievements: AchievementDTO[] | undefined;
}

function Badge({
  achievement,
}: {
  achievement: AchievementDTO;
}) {
  const { colors } = useAppTheme();
  const earned = achievement.earned;

  return (
    <View
      className={`w-[72px] items-center mr-3.5 ${earned ? "opacity-100" : "opacity-40"}`}
    >
      <View
        style={{
          backgroundColor: earned
            ? `${colors.primary}15`
            : `${colors.border}80`,
          borderColor: earned ? `${colors.primary}40` : colors.border,
        }}
        className="w-12 h-12 rounded-[14px] items-center justify-center border-[1.5px]"
      >
        <Text className="text-[20px]">
          {earned ? getIcon(achievement.category) : "?"}
        </Text>
      </View>
      <Text
        className={`mt-1.5 text-[10px] text-center leading-[13px] ${
          earned ? "font-semibold text-[#111c2d] dark:text-[#F8FAFC]" : "font-medium text-[#494454] dark:text-[#94A3B8]"
        }`}
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
      <View className="flex-row justify-between items-baseline mb-3.5">
        <Text className="text-[13px] font-semibold text-[#494454] dark:text-[#94A3B8] uppercase tracking-[0.8px]">
          Achievements
        </Text>
        <Text className="text-[13px] font-medium text-[#494454] dark:text-[#94A3B8]">
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
          <Badge key={a.code} achievement={a} />
        ))}
        {inProgress.map((a) => (
          <Badge key={a.code} achievement={a} />
        ))}
      </ScrollView>
    </Animated.View>
  );
}
