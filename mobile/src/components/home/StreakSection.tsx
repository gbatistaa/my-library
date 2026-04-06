import { View, Text } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import type { StreakDTO } from "@/src/types/profile";

interface Props {
  streak: StreakDTO | undefined;
}

function EmptyStreak() {
  return (
    <View className="py-1">
      <Text className="text-[14px] font-medium text-[#494454] dark:text-[#94A3B8] leading-[20px]">
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
      <Text className="text-[13px] font-semibold text-[#494454] dark:text-[#94A3B8] uppercase tracking-[0.8px] mb-3">
        Reading Streak
      </Text>

      {current === 0 && best === 0 ? (
        <EmptyStreak />
      ) : (
        <View>
          {/* Main streak number */}
          <View className="flex-row items-baseline">
            <Text className="text-[32px] font-bold text-[#111c2d] dark:text-[#F8FAFC] tracking-[-1px]">
              {current}
            </Text>
            <Text className="text-[15px] font-normal text-[#494454] dark:text-[#94A3B8] ml-1.5">
              {current === 1 ? "day" : "days"} in a row
            </Text>
          </View>

          {/* Secondary stats */}
          <View className="flex-row gap-5 mt-2.5">
            <View className="flex-row items-center gap-1.5">
              <Feather name="award" size={13} color={colors.textSecondary} />
              <Text className="text-[13px] text-[#494454] dark:text-[#94A3B8]">
                Best: {best}d
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Feather name="calendar" size={13} color={colors.textSecondary} />
              <Text className="text-[13px] text-[#494454] dark:text-[#94A3B8]">
                {totalDays} total days
              </Text>
            </View>
          </View>

          {/* Progress toward best */}
          {best > 0 && current < best && (
            <View className="mt-3">
              <View className="h-1 rounded-full bg-[#E2E8F0] dark:bg-slate-800 overflow-hidden">
                <View
                  style={{
                    width: `${Math.round(Math.min(current / best, 1) * 100)}%`,
                    backgroundColor: colors.primary,
                  }}
                  className="h-full rounded-full"
                />
              </View>
              <Text className="text-[11px] text-[#494454] dark:text-[#94A3B8] mt-1.5">
                {best - current} {best - current === 1 ? "day" : "days"} to beat
                your record
              </Text>
            </View>
          )}

          {/* Insight */}
          {streak?.insight ? (
            <Text className="text-[13px] text-[#494454] dark:text-[#94A3B8] mt-2.5 leading-[18px]">
              {streak.insight}
            </Text>
          ) : null}
        </View>
      )}
    </Animated.View>
  );
}
