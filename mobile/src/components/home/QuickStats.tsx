import { View, Text } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import type { ReadingDnaDTO, StreakDTO } from "@/src/types/profile";

interface Props {
  dna: ReadingDnaDTO | undefined;
  streak: StreakDTO | undefined;
}

interface StatCardProps {
  iconName: React.ComponentProps<typeof Feather>["name"];
  iconBg: string;
  iconColor: string;
  value: string | number;
  label: string;
}

function StatCard({
  iconName,
  iconBg,
  iconColor,
  value,
  label,
}: StatCardProps) {
  return (
    <View className="flex-1 min-w-[45%] bg-[#ede9fe] dark:bg-[#1E293B] rounded-xl p-5 gap-3">
      {/* Icon circle */}
      <View
        style={{ backgroundColor: iconBg }}
        className="w-10 h-10 rounded-full items-center justify-center"
      >
        <Feather name={iconName} size={18} color={iconColor} />
      </View>

      {/* Value + label */}
      <View className="gap-0.5">
        <Text className="text-[30px] font-bold text-[#111c2d] dark:text-[#F8FAFC] leading-[34px] tracking-tighter">
          {value}
        </Text>
        <Text className="text-[11px] text-[#494454] dark:text-[#94A3B8]">
          {label}
        </Text>
      </View>
    </View>
  );
}

export function QuickStats({ dna, streak }: Props) {
  const { colors } = useAppTheme();

  const booksRead = dna?.totalBooksLifetime ?? 0;
  const pagesRead = dna?.totalPagesLifetime
    ? dna.totalPagesLifetime.toLocaleString()
    : "0";
  const totalDays = streak?.totalReadingDays ?? 0;
  const avgRating = dna?.avgRating ? dna.avgRating.toFixed(1) : "—";

  return (
    <Animated.View entering={FadeIn.duration(300).delay(100)}>
      <Text className="text-[11px] font-semibold text-[#494454] dark:text-[#94A3B8] uppercase tracking-[2px] mb-3.5">
        Quick Insights
      </Text>

      {/* 2×2 bento grid */}
      <View className="flex-row flex-wrap gap-3">
        <StatCard
          iconName="book-open"
          iconBg={colors.violet100}
          iconColor={colors.primary}
          value={booksRead}
          label="Books Read"
        />
        <StatCard
          iconName="file-text"
          iconBg={colors.orange100}
          iconColor={colors.secondary}
          value={pagesRead}
          label="Pages Read"
        />
        <StatCard
          iconName="calendar"
          iconBg={colors.pink100}
          iconColor={colors.tertiary}
          value={totalDays}
          label="Reading Days"
        />
        <StatCard
          iconName="star"
          iconBg={colors.blue100}
          iconColor={colors.blue600}
          value={avgRating}
          label="Avg Rating"
        />
      </View>
    </Animated.View>
  );
}
