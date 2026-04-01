import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import type { ReadingGoalProgressDTO } from "@/src/types/profile";

interface Props {
  progress: ReadingGoalProgressDTO | null | undefined;
}

function CircleProgress({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference * (1 - pct);

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 96,
        height: 96,
      }}
    >
      {/* SVG-style ring via View approach */}
      <View
        style={{
          width: 88,
          height: 88,
          borderRadius: 44,
          borderWidth: 8,
          borderColor: color + "20",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Filled arc simulation using border color on one side */}
        <View
          style={{
            position: "absolute",
            width: 88,
            height: 88,
            borderRadius: 44,
            borderWidth: 8,
            borderColor: "transparent",
            borderTopColor: pct > 0 ? color : "transparent",
            borderRightColor: pct > 0.25 ? color : "transparent",
            borderBottomColor: pct > 0.5 ? color : "transparent",
            borderLeftColor: pct > 0.75 ? color : "transparent",
            transform: [{ rotate: "-90deg" }],
          }}
        />
        <Text style={{ fontSize: 20, fontWeight: "800", color }}>{value}</Text>
      </View>
    </View>
  );
}

export function GoalProgressCard({ progress }: Props) {
  const { colors } = useAppTheme();

  if (!progress) {
    return (
      <Animated.View
        entering={FadeInDown.duration(400).delay(50)}
        style={{
          borderRadius: 20,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderStyle: "dashed",
          padding: 24,
          alignItems: "center",
          gap: 8,
        }}
      >
        <Feather name="target" size={28} color="#64748B" />
        <Text
          style={{
            fontSize: 15,
            fontWeight: "700",
            color: colors.textSecondary,
            textAlign: "center",
          }}
        >
          No Reading Goal for {new Date().getFullYear()}
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: colors.textSecondary,
            textAlign: "center",
          }}
        >
          Set a goal to track your annual reading progress
        </Text>
      </Animated.View>
    );
  }

  const accent = progress.onTrack ? "#10B981" : "#F59E0B";
  const booksRead = progress.booksRead;
  const target = progress.goal.targetBooks;

  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(50)}
      style={{
        borderRadius: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: accent + "30",
        padding: 20,
        shadowColor: accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 4,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        {/* Circular progress */}
        <CircleProgress value={booksRead} max={target} color={accent} />

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text
              style={{ fontSize: 16, fontWeight: "800", color: colors.text }}
            >
              {new Date().getFullYear()} Reading Goal
            </Text>
          </View>
          <Text
            style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}
          >
            {booksRead} of {target} books
          </Text>

          <View
            style={{
              marginTop: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 10,
              backgroundColor: accent + "15",
              alignSelf: "flex-start",
            }}
          >
            <Feather
              name={progress.onTrack ? "check-circle" : "clock"}
              size={12}
              color={accent}
            />
            <Text style={{ fontSize: 12, fontWeight: "700", color: accent }}>
              {progress.onTrack ? "On Track" : "Behind Pace"}
            </Text>
          </View>
        </View>
      </View>

      {/* Progress bar */}
      <View style={{ marginTop: 16 }}>
        <View
          style={{
            height: 6,
            borderRadius: 3,
            backgroundColor: accent + "20",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${Math.round(Math.min(booksRead / Math.max(target, 1), 1) * 100)}%`,
              height: "100%",
              borderRadius: 3,
              backgroundColor: accent,
            }}
          />
        </View>
      </View>

      {/* Daily insight */}
      {progress.dailyInsight ? (
        <View
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 12,
            backgroundColor: accent + "10",
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
            💡 {progress.dailyInsight}
          </Text>
        </View>
      ) : null}
    </Animated.View>
  );
}
