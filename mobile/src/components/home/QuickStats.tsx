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
  colors: any;
}

function StatCard({ iconName, iconBg, iconColor, value, label, colors }: StatCardProps) {
  return (
    <View
      style={{
        width: "48%",
        backgroundColor: colors.surfaceContainerLow,
        borderRadius: 12,
        padding: 20,
        gap: 12,
      }}
    >
      {/* Icon circle */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: iconBg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Feather name={iconName} size={18} color={iconColor} />
      </View>

      {/* Value + label */}
      <View style={{ gap: 3 }}>
        <Text
          style={{
            fontSize: 30,
            fontWeight: "700",
            color: colors.text,
            lineHeight: 34,
            letterSpacing: -0.5,
          }}
        >
          {value}
        </Text>
        <Text
          style={{
            fontSize: 11,
            color: colors.textSecondary,
          }}
        >
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
      <Text
        style={{
          fontSize: 11,
          fontWeight: "600",
          color: colors.textSecondary,
          textTransform: "uppercase",
          letterSpacing: 2,
          marginBottom: 14,
        }}
      >
        Quick Insights
      </Text>

      {/* 2×2 bento grid */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <StatCard
          iconName="book-open"
          iconBg={colors.violet100}
          iconColor={colors.primary}
          value={booksRead}
          label="Books Read"
          colors={colors}
        />
        <StatCard
          iconName="file-text"
          iconBg={colors.orange100}
          iconColor={colors.secondary}
          value={pagesRead}
          label="Pages Read"
          colors={colors}
        />
        <StatCard
          iconName="calendar"
          iconBg={colors.pink100}
          iconColor={colors.tertiary}
          value={totalDays}
          label="Reading Days"
          colors={colors}
        />
        <StatCard
          iconName="star"
          iconBg={colors.blue100}
          iconColor={colors.blue600}
          value={avgRating}
          label="Avg Rating"
          colors={colors}
        />
      </View>
    </Animated.View>
  );
}
