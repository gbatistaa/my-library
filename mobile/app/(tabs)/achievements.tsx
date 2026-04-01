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
  VOLUME: "Volume",
  VELOCITY: "Velocity",
  DIVERSITY: "Diversity",
  GOALS: "Goals",
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  VOLUME: "Read more books and pages",
  VELOCITY: "Improve your reading speed",
  DIVERSITY: "Explore new authors and genres",
  GOALS: "Hit your reading targets",
};

const CATEGORY_ICONS: Record<string, string> = {
  VOLUME: "\u{1F4DA}",
  VELOCITY: "\u26A1",
  DIVERSITY: "\u{1F30D}",
  GOALS: "\u{1F3AF}",
};

function AchievementCard({
  achievement,
  colors,
  index,
}: {
  achievement: AchievementDTO;
  colors: any;
  index: number;
}) {
  const earned = achievement.earned;
  const progress = achievement.progress ?? 0;
  const pct = Math.round(progress * 100);

  return (
    <Animated.View
      entering={FadeInDown.duration(300).delay(index * 40)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        gap: 14,
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 13,
          backgroundColor: earned
            ? colors.primary + "15"
            : colors.border + "60",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1.5,
          borderColor: earned ? colors.primary + "35" : colors.border,
        }}
      >
        <Text style={{ fontSize: 18, opacity: earned ? 1 : 0.5 }}>
          {CATEGORY_ICONS[achievement.category] ?? "\u{1F3C6}"}
        </Text>
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: earned ? "600" : "500",
              color: earned ? colors.text : colors.textSecondary,
              flex: 1,
            }}
            numberOfLines={1}
          >
            {achievement.name}
          </Text>
          {earned && (
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: colors.primary,
                marginLeft: 8,
              }}
            >
              Earned
            </Text>
          )}
        </View>

        <Text
          style={{
            fontSize: 13,
            color: colors.textSecondary,
            marginTop: 2,
            lineHeight: 17,
          }}
          numberOfLines={2}
        >
          {achievement.description}
        </Text>

        {/* Progress bar for unearned */}
        {!earned && (
          <View style={{ marginTop: 8 }}>
            <View
              style={{
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.border,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  borderRadius: 2,
                  backgroundColor: colors.primary,
                }}
              />
            </View>
            <Text
              style={{
                fontSize: 11,
                color: colors.textSecondary,
                marginTop: 4,
              }}
            >
              {achievement.progressLabel || `${pct}%`}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

function CategoryGroup({
  category,
  achievements,
  colors,
}: {
  category: string;
  achievements: AchievementDTO[];
  colors: any;
}) {
  const earned = Array.isArray(achievements)
    ? achievements.filter((a) => a.earned).length
    : 0;
  const total = Array.isArray(achievements) ? achievements.length : 0;

  return (
    <View style={{ marginBottom: 28 }}>
      {/* Category header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 4,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: colors.text,
            letterSpacing: -0.3,
          }}
        >
          {CATEGORY_LABELS[category] ?? category}
        </Text>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "500",
            color: colors.textSecondary,
          }}
        >
          {earned}/{total}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 13,
          color: colors.textSecondary,
          marginBottom: 6,
        }}
      >
        {CATEGORY_DESCRIPTIONS[category] ?? ""}
      </Text>

      {/* Achievement list */}
      {achievements.map((a, i) => (
        <AchievementCard
          key={a.code}
          achievement={a}
          colors={colors}
          index={i}
        />
      ))}
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
          style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 24 }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: colors.text,
              letterSpacing: -0.5,
            }}
          >
            Achievements
          </Text>
          {total > 0 && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "baseline",
                marginTop: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: colors.primary,
                }}
              >
                {earnedTotal} earned
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: colors.textSecondary,
                  marginLeft: 4,
                }}
              >
                out of {total}
              </Text>
            </View>
          )}

          {/* Overall progress bar */}
          {total > 0 && (
            <View
              style={{
                height: 6,
                borderRadius: 3,
                backgroundColor: colors.border,
                overflow: "hidden",
                marginTop: 14,
              }}
            >
              <View
                style={{
                  width: `${Math.round((earnedTotal / total) * 100)}%`,
                  height: "100%",
                  borderRadius: 3,
                  backgroundColor: colors.primary,
                }}
              />
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
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
