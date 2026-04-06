import { View, Text, Pressable, Alert } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { useAppTheme } from "@/src/hooks/useAppTheme";
import { deleteReadingGoal } from "@/src/services/profileService";
import { showApiError } from "@/src/services/apiError";
import type { ReadingGoalDTO, ReadingGoalProgressDTO } from "@/src/types/profile";

interface Props {
  goals: ReadingGoalDTO[];
  currentYearProgress: ReadingGoalProgressDTO | null | undefined;
}

const CURRENT_YEAR = new Date().getFullYear();

// ─── MetricBar ────────────────────────────────────────────────────────────────

function MetricBar({
  label,
  value,
  target,
  color,
  unit,
}: {
  label: string;
  value: number;
  target: number;
  color: string;
  unit: string;
}) {
  const pct = target > 0 ? Math.min(value / target, 1) : 0;

  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-1.5">
        <Text className="text-[12px] font-semibold text-[#494454] dark:text-[#94A3B8]">
          {label}
        </Text>
        <Text className="text-[12px] font-bold text-[#111c2d] dark:text-[#F8FAFC]">
          {value.toLocaleString()} /{" "}
          <Text className="font-normal text-[#494454] dark:text-[#94A3B8]">
            {target.toLocaleString()} {unit}
          </Text>
        </Text>
      </View>
      <View className="h-2 rounded-full bg-[#f1f5f9] dark:bg-slate-950 overflow-hidden">
        <View
          style={{ width: `${Math.round(pct * 100)}%`, backgroundColor: color }}
          className="h-full rounded-full"
        />
      </View>
    </View>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyGoal() {
  const { colors } = useAppTheme();

  return (
    <View className="flex-row items-center gap-3.5 py-2">
      <View
        style={{ backgroundColor: colors.tertiary + "10" }}
        className="w-11 h-11 rounded-xl items-center justify-center"
      >
        <Feather name="target" size={20} color={colors.tertiary} />
      </View>
      <View className="flex-1">
        <Text className="text-[14px] font-semibold text-[#111c2d] dark:text-[#F8FAFC] mb-0.5">
          No goal for {CURRENT_YEAR} yet
        </Text>
        <Text className="text-[13px] text-[#494454] dark:text-[#94A3B8] leading-[17px]">
          Click &apos;New Goal&apos; to track your progress this year.
        </Text>
      </View>
    </View>
  );
}

// ─── Current year card ────────────────────────────────────────────────────────

function CurrentYearCard({
  progress,
  goal,
  onDelete,
}: {
  progress: ReadingGoalProgressDTO;
  goal: ReadingGoalDTO;
  onDelete: () => void;
}) {
  const { colors, mode } = useAppTheme();

  return (
    <View
      className="bg-[#ede9fe] dark:bg-slate-900 rounded-2xl p-5 shadow-sm dark:border dark:border-slate-800 overflow-hidden relative mb-3"
    >
      {/* Header row */}
      <View className="flex-row justify-between items-start mb-4">
        <View>
          <Text className="text-[11px] font-semibold text-[#494454] dark:text-[#94A3B8] uppercase tracking-[2px]">
            {goal.year} Reading Goal
          </Text>
          <Text
            className="text-[13px] font-semibold mt-0.5"
            style={{ color: colors.tertiary }}
          >
            {progress.onTrack ? "On track" : "Behind pace"}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View
            className={`px-2.5 py-1 rounded-full ${
              progress.onTrack
                ? "bg-[#dcfce7] dark:bg-[#10B981]/15"
                : "bg-[#fee2e2] dark:bg-[#EF4444]/15"
            }`}
          >
            <Feather
              name={progress.onTrack ? "check-circle" : "alert-circle"}
              size={14}
              color={
                progress.onTrack
                  ? mode === "dark"
                    ? "#34D399"
                    : "#15803D"
                  : mode === "dark"
                    ? "#F87171"
                    : "#B91C1C"
              }
            />
          </View>
          <Pressable
            onPress={onDelete}
            className="w-8 h-8 rounded-full bg-[#f1f5f9] dark:bg-slate-800 items-center justify-center active:opacity-60"
          >
            <Feather
              name="trash-2"
              size={14}
              color={mode === "dark" ? "#94A3B8" : "#494454"}
            />
          </Pressable>
        </View>
      </View>

      {/* Metric bars */}
      <MetricBar
        label="Books"
        value={progress.booksRead}
        target={goal.targetBooks}
        color={colors.primary}
        unit="books"
      />
      {goal.targetPages != null && (
        <MetricBar
          label="Pages"
          value={progress.pagesRead}
          target={goal.targetPages}
          color={colors.tertiary}
          unit="pages"
        />
      )}
      {goal.targetMinutes != null && (
        <MetricBar
          label="Minutes"
          value={progress.minutesRead}
          target={goal.targetMinutes}
          color={colors.tertiary}
          unit="min"
        />
      )}
      {goal.targetAuthors != null && (
        <MetricBar
          label="Distinct Authors"
          value={progress.uniqueAuthors}
          target={goal.targetAuthors}
          color={colors.tertiary}
          unit="authors"
        />
      )}
      {goal.targetGenres != null && (
        <MetricBar
          label="Distinct Genres"
          value={progress.uniqueGenres}
          target={goal.targetGenres}
          color={colors.tertiary}
          unit="genres"
        />
      )}

      {/* Decorative ambient circle */}
      <View
        style={{ backgroundColor: colors.tertiary + "08" }}
        className="absolute -right-4 -bottom-6 w-24 h-24 rounded-full"
        pointerEvents="none"
      />
    </View>
  );
}

// ─── Past year card ───────────────────────────────────────────────────────────

function PastYearCard({
  goal,
  onDelete,
}: {
  goal: ReadingGoalDTO;
  onDelete: () => void;
}) {
  const { colors, mode } = useAppTheme();

  return (
    <View
      className="rounded-2xl p-4 mb-3 border"
      style={{
        backgroundColor: colors.surfaceContainerLow,
        borderColor: colors.border,
      }}
    >
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-[12px] font-bold text-[#494454] dark:text-[#94A3B8] uppercase tracking-widest">
            {goal.year}
          </Text>
          <Text className="text-[14px] font-semibold text-[#111c2d] dark:text-[#F8FAFC] mt-0.5">
            {goal.targetBooks} books targeted
          </Text>
          {(goal.targetPages != null || goal.targetMinutes != null) && (
            <Text className="text-[12px] text-[#94A3B8] mt-0.5">
              {[
                goal.targetPages != null && `${goal.targetPages} pages`,
                goal.targetMinutes != null && `${goal.targetMinutes} min`,
                goal.targetAuthors != null && `${goal.targetAuthors} authors`,
                goal.targetGenres != null && `${goal.targetGenres} genres`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          )}
        </View>
        <Pressable
          onPress={onDelete}
          className="w-8 h-8 rounded-full bg-[#f1f5f9] dark:bg-[#334155] items-center justify-center active:opacity-60"
        >
          <Feather
            name="trash-2"
            size={14}
            color={mode === "dark" ? "#94A3B8" : "#494454"}
          />
        </Pressable>
      </View>
    </View>
  );
}

// ─── Main GoalSection ─────────────────────────────────────────────────────────

export function GoalSection({ goals, currentYearProgress }: Props) {
  const { colors } = useAppTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleDelete = (goalId: string, year: number) => {
    Alert.alert(
      "Delete Goal",
      `Delete your ${year} reading goal? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteReadingGoal(goalId);
              queryClient.invalidateQueries({ queryKey: ["reading-goals"] });
              queryClient.invalidateQueries({ queryKey: ["goalProgress"] });
            } catch (err) {
              showApiError("Failed to delete goal", err);
            }
          },
        },
      ],
    );
  };

  const currentYearGoal = goals.find((g) => g.year === CURRENT_YEAR);
  const pastGoals = goals.filter((g) => g.year !== CURRENT_YEAR);

  return (
    <Animated.View entering={FadeIn.duration(300).delay(150)}>
      {/* Section header */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-[17px] font-extrabold text-[#111c2d] dark:text-[#F8FAFC]">
          Reading Goals
        </Text>
        <Pressable
          onPress={() => router.push("/create-goal")}
          className="flex-row items-center gap-1.5 py-1.5 px-3 rounded-lg active:opacity-70"
          style={{
            backgroundColor: colors.tertiary + "15",
            borderWidth: 1.5,
            borderColor: colors.tertiary + "40",
          }}
        >
          <Feather name="plus" size={13} color={colors.tertiary} />
          <Text
            className="text-[12px] font-bold"
            style={{ color: colors.tertiary }}
          >
            New Goal
          </Text>
        </Pressable>
      </View>

      {/* No goals at all */}
      {goals.length === 0 && <EmptyGoal />}

      {/* Current year with full progress */}
      {currentYearGoal && currentYearProgress && (
        <CurrentYearCard
          progress={currentYearProgress}
          goal={currentYearGoal}
          onDelete={() => handleDelete(currentYearGoal.id, currentYearGoal.year)}
        />
      )}

      {/* Current year goal exists but no progress yet (e.g., future year) */}
      {currentYearGoal && !currentYearProgress && (
        <PastYearCard
          goal={currentYearGoal}
          onDelete={() =>
            handleDelete(currentYearGoal.id, currentYearGoal.year)
          }
        />
      )}

      {/* Past year goals */}
      {pastGoals.map((goal) => (
        <PastYearCard
          key={goal.id}
          goal={goal}
          onDelete={() => handleDelete(goal.id, goal.year)}
        />
      ))}
    </Animated.View>
  );
}
