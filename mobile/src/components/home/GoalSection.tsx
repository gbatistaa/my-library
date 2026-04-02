import { View, Text, Pressable } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import type { ReadingGoalProgressDTO } from "@/src/types/profile";

interface Props {
  progress: ReadingGoalProgressDTO | null | undefined;
}

function ProgressBar({
  value,
  max,
  colors,
}: {
  value: number;
  max: number;
  colors: any;
}) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  return (
    <View
      style={{
        height: 14,
        borderRadius: 7,
        backgroundColor: colors.surfaceContainerLow,
        overflow: "hidden",
        marginTop: 20,
      }}
    >
      <View
        style={{
          width: `${Math.round(pct * 100)}%`,
          height: "100%",
          borderRadius: 7,
          backgroundColor: colors.primary,
        }}
      />
    </View>
  );
}

function EmptyGoal({ colors }: { colors: any }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingVertical: 8,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 13,
          backgroundColor: colors.primary + "10",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Feather name="target" size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: colors.text,
            marginBottom: 2,
          }}
        >
          No goal for {new Date().getFullYear()} yet
        </Text>
        <Text
          style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 17 }}
        >
          Set a target to track your progress this year.
        </Text>
      </View>
      <Pressable
        style={({ pressed }) => ({
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderRadius: 8,
          borderWidth: 1.5,
          borderColor: colors.primary,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text
          style={{ fontSize: 13, fontWeight: "600", color: colors.primary }}
        >
          Set
        </Text>
      </Pressable>
    </View>
  );
}

export function GoalSection({ progress }: Props) {
  const { colors, mode } = useAppTheme();

  if (!progress) {
    return (
      <Animated.View entering={FadeIn.duration(300).delay(150)}>
        <EmptyGoal colors={colors} />
      </Animated.View>
    );
  }

  const { booksRead, goal, onTrack } = progress;
  if (!goal) return <EmptyGoal colors={colors} />;

  const target = goal.targetBooks;
  const pct = target > 0 ? Math.round(Math.min(booksRead / target, 1) * 100) : 0;
  const remaining = Math.max(0, target - booksRead);

  const onTrackBg = mode === "dark" ? "rgba(16,185,129,0.15)" : "#dcfce7";
  const onTrackText = mode === "dark" ? "#4ade80" : "#15803d";

  return (
    <Animated.View entering={FadeIn.duration(300).delay(150)}>
      {/* Card wrapper */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: mode === "dark" ? 0 : 0.06,
          shadowRadius: 12,
          elevation: 2,
          ...(mode === "dark"
            ? { borderWidth: 1, borderColor: colors.border }
            : {}),
          overflow: "hidden",
        }}
      >
        {/* Top row: label + on-track badge */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: colors.textSecondary,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              {new Date().getFullYear()} Reading Goal
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "baseline", marginTop: 6 }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: colors.text,
                  letterSpacing: -0.5,
                }}
              >
                {booksRead} / {target}{" "}
              </Text>
              <Text style={{ fontSize: 16, color: colors.textSecondary }}>
                books
              </Text>
            </View>
          </View>

          {/* On track badge */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: onTrackBg,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              marginTop: 2,
            }}
          >
            <Text
              style={{ fontSize: 12, fontWeight: "700", color: onTrackText }}
            >
              {onTrack ? "On track" : "Behind pace"}
            </Text>
            <Feather
              name={onTrack ? "check-circle" : "alert-circle"}
              size={12}
              color={onTrackText}
            />
          </View>
        </View>

        {/* Progress bar */}
        <ProgressBar value={booksRead} max={target} colors={colors} />

        {/* Footer */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 10,
          }}
        >
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>
            {pct}% completed
          </Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>
            {remaining} {remaining === 1 ? "book" : "books"} to go
          </Text>
        </View>

        {/* Decorative ambient circle */}
        <View
          style={{
            position: "absolute",
            right: -16,
            bottom: -24,
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: colors.primary + "08",
          }}
          pointerEvents="none"
        />
      </View>
    </Animated.View>
  );
}
