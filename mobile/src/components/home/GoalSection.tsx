import { View, Text, Pressable } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import type { ReadingGoalProgressDTO } from "@/src/types/profile";

interface Props {
  progress: ReadingGoalProgressDTO | null | undefined;
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const { colors } = useAppTheme();

  return (
    <View className="h-3.5 rounded-full bg-[#f1f5f9] dark:bg-[#1E293B] overflow-hidden mt-5">
      <View
        style={{
          width: `${Math.round(pct * 100)}%`,
          backgroundColor: colors.primary,
        }}
        className="h-full rounded-full"
      />
    </View>
  );
}

function EmptyGoal() {
  const { colors } = useAppTheme();
  return (
    <View className="flex-row items-center gap-3.5 py-2">
      <View
        style={{ backgroundColor: colors.primary + "10" }}
        className="w-11 h-11 rounded-xl items-center justify-center"
      >
        <Feather name="target" size={20} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-[14px] font-semibold text-[#111c2d] dark:text-[#F8FAFC] mb-0.5">
          No goal for {new Date().getFullYear()} yet
        </Text>
        <Text className="text-[13px] text-[#494454] dark:text-[#94A3B8] leading-[17px]">
          Set a target to track your progress this year.
        </Text>
      </View>
      <Pressable className="py-2 px-3.5 rounded-lg border-[1.5px] border-[#6b38d4] dark:border-[#A78BFA] active:opacity-70">
        <Text className="text-[13px] font-semibold text-[#6b38d4] dark:text-[#A78BFA]">
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
        <EmptyGoal />
      </Animated.View>
    );
  }

  const { booksRead, goal, onTrack } = progress;
  if (!goal) return <EmptyGoal />;

  const target = goal.targetBooks;
  const pct = target > 0 ? Math.round(Math.min(booksRead / target, 1) * 100) : 0;
  const remaining = Math.max(0, target - booksRead);

  return (
    <Animated.View entering={FadeIn.duration(300).delay(150)}>
      {/* Card wrapper */}
      <View className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 shadow-sm dark:border dark:border-[#334155] overflow-hidden relative">
        {/* Top row: label + on-track badge */}
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-[11px] font-semibold text-[#494454] dark:text-[#94A3B8] uppercase tracking-[2px]">
              {new Date().getFullYear()} Reading Goal
            </Text>
            <View className="flex-row items-baseline mt-1.5">
              <Text className="text-[24px] font-bold text-[#111c2d] dark:text-[#F8FAFC] tracking-tighter">
                {booksRead} / {target}{" "}
              </Text>
              <Text className="text-[16px] text-[#494454] dark:text-[#94A3B8]">
                books
              </Text>
            </View>
          </View>

          {/* On track badge */}
          <View
            className={`flex-row items-center gap-1 px-3 py-1.5 rounded-full mt-0.5 ${
              onTrack
                ? "bg-green-100 dark:bg-green-900/30"
                : "bg-red-100 dark:bg-red-900/30"
            }`}
          >
            <Text
              className={`text-[12px] font-bold ${
                onTrack ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
              }`}
            >
              {onTrack ? "On track" : "Behind pace"}
            </Text>
            <Feather
              name={onTrack ? "check-circle" : "alert-circle"}
              size={12}
              color={
                onTrack
                  ? mode === "dark" ? "#4ade80" : "#15803d"
                  : mode === "dark" ? "#f87171" : "#b91c1c"
              }
            />
          </View>
        </View>

        {/* Progress bar */}
        <ProgressBar value={booksRead} max={target} />

        {/* Footer */}
        <View className="flex-row justify-between mt-2.5">
          <Text className="text-[12px] text-[#494454] dark:text-[#94A3B8]">
            {pct}% completed
          </Text>
          <Text className="text-[12px] text-[#494454] dark:text-[#94A3B8]">
            {remaining} {remaining === 1 ? "book" : "books"} to go
          </Text>
        </View>

        {/* Decorative ambient circle */}
        <View
          style={{ backgroundColor: colors.primary + "08" }}
          className="absolute -right-4 -bottom-6 w-24 h-24 rounded-full"
          pointerEvents="none"
        />
      </View>
    </Animated.View>
  );
}
