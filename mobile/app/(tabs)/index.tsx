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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getInitials(name?: string, username?: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }
  if (username?.trim()) return username[0].toUpperCase();
  return "R";
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

  const currentStreak = streak?.currentStreak ?? 0;
  const greeting = getGreeting();
  const initials = getInitials(user?.name, user?.username);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
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
        {/* ── Header: avatar + greeting + streak badge ──── */}
        <Animated.View
          entering={FadeIn.duration(400)}
          style={{
            paddingTop: 14,
            paddingBottom: 24,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {/* Avatar circle */}
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.surfaceContainerHigh,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: colors.primary,
                }}
              >
                {initials}
              </Text>
            </View>

            <View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: colors.textSecondary,
                }}
              >
                {greeting}, Curator
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: colors.primary,
                  letterSpacing: -0.5,
                  marginTop: 1,
                }}
              >
                @{user?.username ?? "reader"}
              </Text>
            </View>
          </View>

          {/* Streak pill */}
          {!loadingStreak && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                backgroundColor: colors.secondary + "2E",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 9999,
              }}
            >
              <Text style={{ fontSize: 16 }}>{"\uD83D\uDD25"}</Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: colors.secondary,
                }}
              >
                {currentStreak} days
              </Text>
            </View>
          )}
        </Animated.View>

        <View style={{ gap: 40 }}>
          {/* ── Currently Reading (horizontal scroll) ──── */}
          {loadingBooks ? (
            <View>
              <Skeleton height={180} />
            </View>
          ) : (
            <CurrentlyReading books={currentlyReading} />
          )}

          {/* ── Quick Stats (bento grid) ────────────── */}
          <View>
            {loadingDna && loadingStreak ? (
              <Skeleton height={260} />
            ) : (
              <QuickStats dna={dna} streak={streak} />
            )}
          </View>

          {/* ── Reading Goal ─────────────────────────── */}
          <View>
            {loadingGoal ? (
              <Skeleton height={160} />
            ) : (
              <GoalSection progress={goalProgress} />
            )}
          </View>

          {/* ── Achievements ─────────────────────────── */}
          {loadingAchievements ? (
            <View>
              <Skeleton height={120} />
            </View>
          ) : (
            <AchievementsRow achievements={achievements} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
