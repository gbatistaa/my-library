import { View, Text } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import type { StreakDTO } from "@/src/types/profile";

interface Props {
  streak: StreakDTO | undefined;
}

function EmptyStreak({ colors }: { colors: any }) {
  return (
    <View style={{ paddingVertical: 4 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "500",
          color: colors.textSecondary,
          lineHeight: 20,
        }}
      >
        Read today to start building your streak.
      </Text>
    </View>
  );
}

export function StreakSection({ streak }: Props) {
  const { colors } = useAppTheme();
  const current = streak?.currentStreak ?? 0;
  const best = streak?.bestStreak ?? 0;
  const totalDays = streak?.totalReadingDays ?? 0;

  return (
    <Animated.View entering={FadeIn.duration(300).delay(200)}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: colors.textSecondary,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          marginBottom: 12,
        }}
      >
        Reading Streak
      </Text>

      {current === 0 && best === 0 ? (
        <EmptyStreak colors={colors} />
      ) : (
        <View>
          {/* Main streak number */}
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "700",
                color: colors.text,
                letterSpacing: -1,
              }}
            >
              {current}
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "400",
                color: colors.textSecondary,
                marginLeft: 6,
              }}
            >
              {current === 1 ? "day" : "days"} in a row
            </Text>
          </View>

          {/* Secondary stats */}
          <View
            style={{
              flexDirection: "row",
              gap: 20,
              marginTop: 10,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Feather name="award" size={13} color={colors.textSecondary} />
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                Best: {best}d
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Feather name="calendar" size={13} color={colors.textSecondary} />
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                {totalDays} total days
              </Text>
            </View>
          </View>

          {/* Progress toward best */}
          {best > 0 && current < best && (
            <View style={{ marginTop: 12 }}>
              <View
                style={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.border,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: `${Math.round(Math.min(current / best, 1) * 100)}%`,
                    height: "100%",
                    borderRadius: 2,
                    backgroundColor: colors.primary,
                  }}
                />
              </View>
              <Text
                style={{
                  fontSize: 11,
                  color: colors.textSecondary,
                  marginTop: 5,
                }}
              >
                {best - current} {best - current === 1 ? "day" : "days"} to beat
                your record
              </Text>
            </View>
          )}

          {/* Insight */}
          {streak?.insight ? (
            <Text
              style={{
                fontSize: 13,
                color: colors.textSecondary,
                marginTop: 10,
                lineHeight: 18,
              }}
            >
              {streak.insight}
            </Text>
          ) : null}
        </View>
      )}
    </Animated.View>
  );
}
