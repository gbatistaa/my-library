import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { colors as themeColors } from "@/src/theme/colors";
import type { StreakDTO } from "@/src/types/profile";
import type { ReadingDnaDTO } from "@/src/types/profile";

interface Props {
  dna: ReadingDnaDTO | undefined;
  streak: StreakDTO | undefined;
}

interface StatItemProps {
  icon: React.ComponentProps<typeof Feather>["name"];
  iconColor: string;
  label: string;
  value: string | number;
}

function StatItem({ icon, iconColor, label, value }: StatItemProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 18,
        padding: 16,
        gap: 6,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: iconColor + "1A",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Feather name={icon} size={16} color={iconColor} />
      </View>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "800",
          color: iconColor,
          letterSpacing: -0.5,
        }}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 10,
          fontWeight: "700",
          color: "#94A3B8",
          textTransform: "uppercase",
          letterSpacing: 0.8,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export function StatsGrid({ dna, streak }: Props) {
  const { colors } = useAppTheme();
  const avgRating = dna?.avgRating ? dna.avgRating.toFixed(1) : "—";
  const topGenre = dna?.genreBreakdown?.[0]?.genre ?? "—";

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <StatItem
          icon="book-open"
          iconColor={colors.primary}
          label="Books Read"
          value={dna?.totalBooksLifetime ?? 0}
        />
        <StatItem
          icon="file-text"
          iconColor={themeColors.cyan}
          label="Pages Read"
          value={dna?.totalPagesLifetime?.toLocaleString() ?? "0"}
        />
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <StatItem
          icon="zap"
          iconColor={themeColors.streak}
          label="Day Streak"
          value={streak?.currentStreak ?? 0}
        />
        <StatItem
          icon="calendar"
          iconColor="#10B981"
          label="Reading Days"
          value={streak?.totalReadingDays ?? 0}
        />
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <StatItem
          icon="star"
          iconColor={themeColors.achievement}
          label="Avg Rating"
          value={avgRating}
        />
        <StatItem
          icon="tag"
          iconColor="#8B5CF6"
          label="Top Genre"
          value={topGenre}
        />
      </View>
    </View>
  );
}
