import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useState, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeIn } from "react-native-reanimated";

import { userAtom } from "@/src/store/auth";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import {
  getStreak,
  getAchievements,
  getReadingDna,
  getGoalProgress,
} from "@/src/services/profileService";
import { getCurrentlyReading } from "@/src/services/bookService";

import { CurrentlyReading } from "@/src/components/home/CurrentlyReading";
import { QuickStats } from "@/src/components/home/QuickStats";
import { GoalSection } from "@/src/components/home/GoalSection";
import { StreakSection } from "@/src/components/home/StreakSection";
import { AchievementsRow } from "@/src/components/home/AchievementsRow";

function Skeleton({ height = 120 }: { height?: number }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        height,
        borderRadius: 12,
        backgroundColor: colors.border + "40",
        opacity: 0.5,
      }}
    />
  );
}

export default function HomeScreen() {
  const { colors, mode } = useAppTheme();
  const insets = useSafeAreaInsets();
  const user = useAtomValue(userAtom);
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const currentYear = new Date().getFullYear();

  const { data: currentlyReading, isLoading: loadingBooks } = useQuery({
    queryKey: ["currentlyReading"],
    queryFn: getCurrentlyReading,
    retry: 1,
  });

  const { data: streak, isLoading: loadingStreak } = useQuery({
    queryKey: ["streak"],
    queryFn: getStreak,
    retry: 1,
  });

  const { data: dna, isLoading: loadingDna } = useQuery({
    queryKey: ["dna"],
    queryFn: getReadingDna,
    retry: 1,
  });

  const { data: achievements, isLoading: loadingAchievements } = useQuery({
    queryKey: ["achievements"],
    queryFn: getAchievements,
    retry: 1,
  });

  const { data: goalProgress, isLoading: loadingGoal } = useQuery({
    queryKey: ["goalProgress", currentYear],
    queryFn: () => getGoalProgress(currentYear),
    retry: 1,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["currentlyReading"] }),
      queryClient.invalidateQueries({ queryKey: ["streak"] }),
      queryClient.invalidateQueries({ queryKey: ["dna"] }),
      queryClient.invalidateQueries({ queryKey: ["achievements"] }),
      queryClient.invalidateQueries({ queryKey: ["goalProgress"] }),
    ]);
    setRefreshing(false);
  }, [queryClient]);

  const firstName = user?.name?.trim()
    ? user.name.split(" ")[0]
    : (user?.username ?? "Reader");
  const currentStreak = streak?.currentStreak ?? 0;

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
        {/* ── Header: greeting + streak badge ──── */}
        <Animated.View
          entering={FadeIn.duration(400)}
          style={{
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 24,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: colors.textSecondary,
              }}
            >
              Welcome back,
            </Text>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                color: colors.text,
                letterSpacing: -0.5,
                marginTop: 2,
              }}
            >
              {firstName}
            </Text>
          </View>

          {/* Streak pill */}
          {!loadingStreak && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                backgroundColor: colors.primary + "12",
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 20,
                marginTop: 4,
              }}
            >
              <Text style={{ fontSize: 16 }}>{"\uD83D\uDD25"}</Text>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: colors.primary,
                }}
              >
                {currentStreak}
              </Text>
            </View>
          )}
        </Animated.View>

        <View style={{ paddingHorizontal: 20, gap: 32 }}>
          {/* ── Currently Reading (hero) ─────────── */}
          {loadingBooks ? (
            <Skeleton height={140} />
          ) : (
            <CurrentlyReading books={currentlyReading} />
          )}

          {/* ── Stats ─────────────────────────── */}
          {loadingDna && loadingStreak ? (
            <Skeleton height={200} />
          ) : (
            <QuickStats dna={dna} streak={streak} />
          )}

          {/* ── Reading Goal ───────────────────── */}
          {loadingGoal ? (
            <Skeleton height={80} />
          ) : (
            <GoalSection progress={goalProgress} />
          )}

          {/* ── Streak Detail ──────────────────── */}
          {loadingStreak ? (
            <Skeleton height={80} />
          ) : (
            <StreakSection streak={streak} />
          )}

          {/* ── Achievements ───────────────────── */}
          {loadingAchievements ? (
            <Skeleton height={80} />
          ) : (
            <AchievementsRow achievements={achievements} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
