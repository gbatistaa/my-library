import { View, Text } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import type { ReadingDnaDTO, StreakDTO } from "@/src/types/profile";

interface Props {
  dna: ReadingDnaDTO | undefined;
  streak: StreakDTO | undefined;
}

function StatRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string | number;
  colors: any;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 13,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Feather name={icon} size={16} color={colors.textSecondary} />
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: colors.textSecondary,
          }}
        >
          {label}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: colors.text,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function Separator({ colors }: { colors: any }) {
  return (
    <View style={{ height: 1, backgroundColor: colors.border + "80" }} />
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
  const topGenre = dna?.genreBreakdown?.[0]?.genre ?? "—";

  return (
    <Animated.View entering={FadeIn.duration(300).delay(100)}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: colors.textSecondary,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          marginBottom: 6,
        }}
      >
        Your numbers
      </Text>

      <StatRow icon="book-open" label="Books read" value={booksRead} colors={colors} />
      <Separator colors={colors} />
      <StatRow icon="file-text" label="Pages read" value={pagesRead} colors={colors} />
      <Separator colors={colors} />
      <StatRow icon="calendar" label="Reading days" value={totalDays} colors={colors} />
      <Separator colors={colors} />
      <StatRow icon="star" label="Avg rating" value={avgRating} colors={colors} />
      <Separator colors={colors} />
      <StatRow icon="tag" label="Top genre" value={topGenre} colors={colors} />
    </Animated.View>
  );
}
