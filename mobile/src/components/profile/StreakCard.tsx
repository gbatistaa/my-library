import { View, Text } from "react-native";
import Animated, { FadeInLeft } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { colors as themeColors } from "@/src/theme/colors";
import type { StreakDTO } from "@/src/types/profile";

interface Props {
  streak: StreakDTO | undefined;
}

function FlameBar({ current, best }: { current: number; best: number }) {
  const pct = best > 0 ? Math.min(current / best, 1) : 0;
  return (
    <View style={{ marginTop: 12 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <Text style={{ fontSize: 11, color: "#94A3B8", fontWeight: "600" }}>
          Progress to best streak
        </Text>
        <Text
          style={{ fontSize: 11, color: themeColors.streak, fontWeight: "700" }}
        >
          {current}/{best} days
        </Text>
      </View>
      <View
        style={{
          height: 6,
          borderRadius: 3,
          backgroundColor: themeColors.streak + "25",
          overflow: "hidden",
        }}
      >
        <Animated.View
          style={{
            width: `${Math.round(pct * 100)}%`,
            height: "100%",
            borderRadius: 3,
            backgroundColor: themeColors.streak,
          }}
        />
      </View>
    </View>
  );
}

export function StreakCard({ streak }: Props) {
  const { colors } = useAppTheme();

  return (
    <Animated.View
      entering={FadeInLeft.duration(400).delay(100)}
      style={{
        borderRadius: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: themeColors.streak + "30",
        padding: 20,
        shadowColor: themeColors.streak,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 4,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {/* Big streak number */}
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            backgroundColor: themeColors.streak + "18",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              color: themeColors.streak,
            }}
          >
            {streak?.currentStreak ?? 0}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text
              style={{ fontSize: 16, fontWeight: "700", color: colors.text }}
            >
              Day Streak 🔥
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 16, marginTop: 4 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Feather name="award" size={12} color={themeColors.achievement} />
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                Best: {streak?.bestStreak ?? 0}d
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Feather name="calendar" size={12} color="#10B981" />
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                {streak?.totalReadingDays ?? 0} total days
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Progress bar */}
      <FlameBar
        current={streak?.currentStreak ?? 0}
        best={Math.max(streak?.bestStreak ?? 1, 1)}
      />

      {/* Dynamic insight */}
      {streak?.insight ? (
        <View
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 12,
            backgroundColor: themeColors.streak + "10",
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: colors.textSecondary,
              lineHeight: 18,
              fontStyle: "italic",
            }}
          >
            💡 {streak.insight}
          </Text>
        </View>
      ) : null}
    </Animated.View>
  );
}
