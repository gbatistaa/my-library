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
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.border,
        overflow: "hidden",
        marginTop: 12,
      }}
    >
      <View
        style={{
          width: `${Math.round(pct * 100)}%`,
          height: "100%",
          borderRadius: 3,
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
  const { colors } = useAppTheme();

  if (!progress) {
    return (
      <Animated.View entering={FadeIn.duration(300).delay(150)}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "600",
            color: colors.textSecondary,
            textTransform: "uppercase",
            letterSpacing: 0.8,
            marginBottom: 10,
          }}
        >
          {new Date().getFullYear()} Goal
        </Text>
        <EmptyGoal colors={colors} />
      </Animated.View>
    );
  }

  const { booksRead, goal, onTrack } = progress;
  if (!goal) return <EmptyGoal colors={colors} />;
  const target = goal.targetBooks;

  return (
    <Animated.View entering={FadeIn.duration(300).delay(150)}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "baseline",
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
          {new Date().getFullYear()} Goal
        </Text>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "500",
            color: onTrack ? colors.primary : colors.textSecondary,
          }}
        >
          {onTrack ? "On track" : "Behind pace"}
        </Text>
      </View>

      <View
        style={{ flexDirection: "row", alignItems: "baseline", marginTop: 8 }}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: "700",
            color: colors.text,
            letterSpacing: -1,
          }}
        >
          {booksRead}
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: colors.textSecondary,
            marginLeft: 6,
          }}
        >
          of {target} books
        </Text>
      </View>

      <ProgressBar value={booksRead} max={target} colors={colors} />

      {progress.dailyInsight ? (
        <Text
          style={{
            fontSize: 13,
            color: colors.textSecondary,
            marginTop: 10,
            lineHeight: 18,
          }}
        >
          {progress.dailyInsight}
        </Text>
      ) : null}
    </Animated.View>
  );
}
