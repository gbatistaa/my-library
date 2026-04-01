import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useState, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { useAppTheme } from "@/src/hooks/useAppTheme";
import { getAchievements } from "@/src/services/profileService";
import type { AchievementDTO } from "@/src/types/profile";

const CATEGORY_ORDER = ["VOLUME", "VELOCITY", "DIVERSITY", "GOALS"] as const;

const CATEGORY_LABELS: Record<string, string> = {
  VOLUME: "VOLUME",
  VELOCITY: "VELOCITY",
  DIVERSITY: "DIVERSITY",
  GOALS: "GOALS",
};

const CATEGORY_EMOJIS: Record<string, string> = {
  VOLUME: "\u{1F4DA}",
  VELOCITY: "\u26A1",
  DIVERSITY: "\u{1F30D}",
  GOALS: "\u{1F3AF}",
};

// Unique emojis per achievement name, with category-based fallbacks
const ACHIEVEMENT_EMOJIS: Record<string, string> = {
  Bookworm: "\u{1F4D6}",
  "Library Titan": "\u{1F3DB}\uFE0F",
  "Speed Reader": "\u{1F3CE}\uFE0F",
  "On Fire": "\u{1F525}",
  Historian: "\u{1F3FA}",
  "Future Seeker": "\u{1F6F8}",
  "New Year Pro": "\u{1F3C5}",
  "Peak Focus": "\u{1F9D7}",
};

function getAchievementEmoji(achievement: AchievementDTO): string {
  return (
    ACHIEVEMENT_EMOJIS[achievement.name] ??
    CATEGORY_EMOJIS[achievement.category] ??
    "\u{1F3C6}"
  );
}

// Map categories to color keys for earned icon backgrounds
function getIconBgColor(
  category: string,
  earned: boolean,
  colors: any,
  mode: string
): string {
  if (!earned) {
    return colors.surfaceContainerHigh;
  }
  if (mode === "dark") {
    return colors.primary + "33"; // 20% opacity
  }
  switch (category) {
    case "VOLUME":
      return colors.primaryFixed;
    case "VELOCITY":
      return colors.secondaryFixed;
    case "DIVERSITY":
      return colors.tertiaryFixed;
    case "GOALS":
      return colors.primaryFixed;
    default:
      return colors.primaryFixed;
  }
}

function AchievementCard({
  achievement,
  colors,
  mode,
  index,
}: {
  achievement: AchievementDTO;
  colors: any;
  mode: string;
  index: number;
}) {
  const earned = achievement.earned;
  const progress = achievement.progress ?? 0;
  const pct = Math.round(progress * 100);

  const cardBg = earned
    ? colors.surface
    : mode === "dark"
      ? colors.surface + "66" // 40% opacity
      : colors.surface + "99"; // 60% opacity

  const cardBorder = earned
    ? mode === "dark"
      ? colors.outline + "1A" // 10% opacity
      : "transparent"
    : mode === "dark"
      ? colors.outline + "33" // 20% opacity
      : colors.outlineVariant + "1A"; // 10% opacity

  return (
    <Animated.View
      entering={FadeInDown.duration(300).delay(index * 40)}
      style={{
        width: "48%",
        backgroundColor: cardBg,
        padding: 20,
        borderRadius: 12,
        alignItems: "center",
        opacity: earned ? 1 : 0.8,
        borderWidth: earned ? (mode === "dark" ? 1 : 0) : 1,
        borderColor: cardBorder,
      }}
    >
      {/* Icon circle */}
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: getIconBgColor(
            achievement.category,
            earned,
            colors,
            mode
          ),
          alignItems: "center",
          justifyContent: "center",
          opacity: earned ? 1 : 0.6,
        }}
      >
        <Text
          style={{
            fontSize: 28,
          }}
        >
          {getAchievementEmoji(achievement)}
        </Text>
      </View>

      {/* Title */}
      <Text
        style={{
          fontWeight: "700",
          color: colors.text,
          textAlign: "center",
          marginTop: 16,
        }}
        numberOfLines={2}
      >
        {achievement.name}
      </Text>

      {/* Description */}
      <Text
        style={{
          fontSize: 12,
          color: colors.textSecondary,
          textAlign: "center",
          lineHeight: 18,
          marginTop: 4,
          marginBottom: 12,
        }}
        numberOfLines={3}
      >
        {achievement.description}
      </Text>

      {/* Progress bar */}
      <View
        style={{
          width: "100%",
          height: 6,
          borderRadius: 3,
          backgroundColor: colors.primary + "1A", // 10% opacity
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: earned ? "100%" : `${pct}%`,
            height: "100%",
            borderRadius: 3,
            backgroundColor: colors.primary,
          }}
        />
      </View>

      {/* Progress label for unearned */}
      {!earned && (
        <Text
          style={{
            fontSize: 10,
            fontWeight: "700",
            color: colors.primary,
            marginTop: 8,
          }}
        >
          {achievement.progressLabel || `${pct}%`}
        </Text>
      )}
    </Animated.View>
  );
}

function CategoryGroup({
  category,
  achievements,
  colors,
  mode,
}: {
  category: string;
  achievements: AchievementDTO[];
  colors: any;
  mode: string;
}) {
  return (
    <View style={{ marginBottom: 48 }}>
      {/* Category header: emoji + uppercase label */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 24,
        }}
      >
        <Text style={{ fontSize: 20 }}>
          {CATEGORY_EMOJIS[category] ?? "\u{1F3C6}"}
        </Text>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: colors.text,
            opacity: 0.6,
            textTransform: "uppercase",
            letterSpacing: 3,
          }}
        >
          {CATEGORY_LABELS[category] ?? category}
        </Text>
      </View>

      {/* Achievement grid (2 columns) */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {achievements.map((a, i) => (
          <AchievementCard
            key={a.code}
            achievement={a}
            colors={colors}
            mode={mode}
            index={i}
          />
        ))}
      </View>
    </View>
  );
}

function EmptyState({ colors }: { colors: any }) {
  return (
    <View style={{ paddingVertical: 60, alignItems: "center" }}>
      <Text style={{ fontSize: 40, marginBottom: 16 }}>{"\u{1F3C6}"}</Text>
      <Text
        style={{
          fontSize: 17,
          fontWeight: "600",
          color: colors.text,
          marginBottom: 6,
        }}
      >
        No achievements yet
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: colors.textSecondary,
          textAlign: "center",
          lineHeight: 20,
          maxWidth: 260,
        }}
      >
        Start reading to unlock your first badges. There are 16 to collect!
      </Text>
    </View>
  );
}

export default function AchievementsScreen() {
  const { colors, mode } = useAppTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: achievements, isLoading } = useQuery({
    queryKey: ["achievements"],
    queryFn: getAchievements,
    retry: 1,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["achievements"] });
    setRefreshing(false);
  }, [queryClient]);

  const safeAchievements = Array.isArray(achievements) ? achievements : [];
  const earnedTotal = safeAchievements.filter((a) => a.earned).length;
  const total = safeAchievements.length;

  // Group by category
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: safeAchievements.filter((a) => a.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingBottom: 48,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(400)}
          style={{
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 24,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              color: colors.text,
              letterSpacing: -0.5,
            }}
          >
            Achievements
          </Text>
          {total > 0 && (
            <View
              style={{
                backgroundColor: colors.primary + "1A", // 10% opacity
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderRadius: 999,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: colors.primary,
                }}
              >
                {earnedTotal} / {total} earned
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Content */}
        <View style={{ paddingHorizontal: 20 }}>
          {isLoading ? (
            <View style={{ gap: 16, paddingTop: 20 }}>
              {[120, 100, 140, 100].map((h, i) => (
                <View
                  key={i}
                  style={{
                    height: h,
                    borderRadius: 12,
                    backgroundColor: colors.border + "40",
                    opacity: 0.5,
                  }}
                />
              ))}
            </View>
          ) : grouped.length === 0 ? (
            <EmptyState colors={colors} />
          ) : (
            grouped.map((g) => (
              <CategoryGroup
                key={g.category}
                category={g.category}
                achievements={g.items}
                colors={colors}
                mode={mode}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
