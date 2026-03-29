import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { colors as themeColors } from "@/src/theme/colors";
import type { AchievementDTO } from "@/src/types/profile";

interface Props {
  achievements: AchievementDTO[] | undefined;
}

const CATEGORY_COLORS: Record<string, string> = {
  VOLUME: "#6366F1",
  VELOCITY: "#F59E0B",
  DIVERSITY: "#06B6D4",
  GOALS: "#10B981",
};

const CATEGORY_ICONS: Record<string, string> = {
  VOLUME: "📚",
  VELOCITY: "⚡",
  DIVERSITY: "🌍",
  GOALS: "🎯",
};

interface BadgeProps {
  achievement: AchievementDTO;
}

function Badge({ achievement }: BadgeProps) {
  const { colors } = useAppTheme();
  const accent = CATEGORY_COLORS[achievement.category] ?? "#6366F1";
  const earned = achievement.earned;

  return (
    <View
      style={{
        width: 100,
        alignItems: "center",
        marginRight: 12,
        opacity: earned ? 1 : 0.45,
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          backgroundColor: earned ? accent + "20" : colors.border + "80",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 2,
          borderColor: earned ? accent + "60" : colors.border,
          shadowColor: earned ? accent : "transparent",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: earned ? 4 : 0,
        }}
      >
        <Text style={{ fontSize: 26 }}>
          {CATEGORY_ICONS[achievement.category] ?? "🏆"}
        </Text>
      </View>
      {/* Progress under unearned */}
      {!earned && achievement.progress !== null ? (
        <View
          style={{
            marginTop: 6,
            width: 64,
            height: 3,
            borderRadius: 2,
            backgroundColor: colors.border,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${Math.round((achievement.progress ?? 0) * 100)}%`,
              height: "100%",
              backgroundColor: accent,
              borderRadius: 2,
            }}
          />
        </View>
      ) : null}
      <Text
        style={{
          marginTop: 6,
          fontSize: 11,
          fontWeight: "700",
          color: earned ? "#F8FAFC" : "#64748B",
          textAlign: "center",
          lineHeight: 15,
        }}
        numberOfLines={2}
      >
        {achievement.name}
      </Text>
      {!earned && achievement.progressLabel ? (
        <Text
          style={{
            fontSize: 9,
            color: accent,
            fontWeight: "600",
            marginTop: 2,
            textAlign: "center",
          }}
        >
          {achievement.progressLabel}
        </Text>
      ) : null}
    </View>
  );
}

export function AchievementsSection({ achievements }: Props) {
  const { colors } = useAppTheme();

  const earned = (achievements ?? []).filter((a) => a.earned);
  const unearned = (achievements ?? []).filter((a) => !a.earned);
  const earnedCount = earned.length;
  const totalCount = (achievements ?? []).length;

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(150)}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <Text
          style={{
            fontSize: 17,
            fontWeight: "800",
            color: colors.text,
            letterSpacing: -0.3,
          }}
        >
          🏆 Achievements
        </Text>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 10,
            backgroundColor: themeColors.achievement + "18",
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: themeColors.achievement,
            }}
          >
            {earnedCount}/{totalCount}
          </Text>
        </View>
      </View>

      {/* Earned row */}
      {earned.length > 0 ? (
        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: "#94A3B8",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 10,
            }}
          >
            Earned
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {earned.map((a) => (
              <Badge key={a.code} achievement={a} />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* In progress row */}
      {unearned.length > 0 ? (
        <View>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: "#94A3B8",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 10,
            }}
          >
            In Progress
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {unearned.slice(0, 8).map((a) => (
              <Badge key={a.code} achievement={a} />
            ))}
          </ScrollView>
        </View>
      ) : null}
    </Animated.View>
  );
}
