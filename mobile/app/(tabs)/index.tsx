import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useState, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeIn } from "react-native-reanimated";

import { userAtom } from "@/src/store/auth";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useProfilePicture } from "@/src/hooks/useProfilePicture";
import {
  getStreak,
  getAchievements,
  getReadingDna,
  getGoalProgress,
  listReadingGoals,
} from "@/src/services/profileService";
import { getCurrentlyReading } from "@/src/services/bookService";

import { CurrentlyReading } from "@/src/components/home/CurrentlyReading";
import { QuickStats } from "@/src/components/home/QuickStats";
import { GoalSection } from "@/src/components/home/GoalSection";
import { AchievementsRow } from "@/src/components/home/AchievementsRow";
import { Avatar } from "@/src/components/common/Avatar";

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

  const { data: allGoals, isLoading: loadingGoals } = useQuery({
    queryKey: ["reading-goals"],
    queryFn: listReadingGoals,
    retry: 1,
  });

  const { data: goalProgress, isLoading: loadingGoalProgress } = useQuery({
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
      queryClient.invalidateQueries({ queryKey: ["reading-goals"] }),
      queryClient.invalidateQueries({ queryKey: ["goalProgress"] }),
    ]);
    setRefreshing(false);
  }, [queryClient]);

  const openProfilePicPicker = useProfilePicture();
  const currentStreak = streak?.currentStreak ?? 0;
  const greeting = getGreeting();

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
            {/* Avatar */}
            {user && (
              <Avatar
                user={user}
                size={40}
                editable
                onPress={openProfilePicPicker}
                accentColor={colors.primary}
              />
            )}

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
            {loadingGoals || loadingGoalProgress ? (
              <Skeleton height={200} />
            ) : (
              <GoalSection
                goals={allGoals ?? []}
                currentYearProgress={goalProgress}
              />
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
