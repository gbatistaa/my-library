import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useState, useCallback, useRef, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
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
  fetchCurrentUser,
} from "@/src/services/profileService";
import { getCurrentlyReading } from "@/src/services/bookService";
import { sendTestEmail } from "@/src/services/emailService";

import { useRouter } from "expo-router";
import { CurrentlyReading } from "@/src/components/home/CurrentlyReading";
import { QuickStats } from "@/src/components/home/QuickStats";
import { GoalSection } from "@/src/components/home/GoalSection";
import { AchievementsRow } from "@/src/components/home/AchievementsRow";
import { Avatar } from "@/src/components/common/Avatar";
import {
  XpProgressRing,
  XpLabel,
} from "@/src/components/common/XpProgressRing";
import { XpFloatingFeedback } from "@/src/components/common/XpFloatingFeedback";

function Skeleton({ height = 120 }: { height?: number }) {
  const { colors } = useAppTheme();
  return (
    <View
      className="opacity-50 rounded-xl"
      style={{ height, backgroundColor: colors.border + "40" }}
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
  const router = useRouter();
  const { colors, mode } = useAppTheme();
  const insets = useSafeAreaInsets();
  const user = useAtomValue(userAtom);
  const setUser = useSetAtom(userAtom);
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [xpGain, setXpGain] = useState<number | null>(null);
  const prevXpRef = useRef<number | null>(null);
  const currentYear = new Date().getFullYear();

  const { data: freshUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    retry: 1,
  });

  useEffect(() => {
    if (!freshUser) return;
    const prevXp = prevXpRef.current;
    if (prevXp !== null && freshUser.totalExperience > prevXp) {
      setXpGain(freshUser.totalExperience - prevXp);
    }
    prevXpRef.current = freshUser.totalExperience;
    setUser(freshUser);
  }, [freshUser, setUser]);

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
      queryClient.invalidateQueries({ queryKey: ["currentUser"] }),
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
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <ScrollView
        contentContainerClassName="px-5 pb-12"
        contentContainerStyle={{ paddingTop: insets.top + 10 }}
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
          className="flex-row justify-between items-center pt-3.5 pb-6"
        >
          <View className="flex-row items-center gap-3">
            {/* Avatar wrapped in XP ring */}
            {user && (
              <View>
                <XpProgressRing
                  currentXp={user.currentXp ?? 0}
                  xpForNextLevel={(user.level ?? 1) * 100}
                  size={52}
                  strokeWidth={3}
                >
                  <Avatar
                    user={user}
                    size={40}
                    editable
                    onPress={openProfilePicPicker}
                    accentColor={colors.primary}
                  />
                </XpProgressRing>
                <XpLabel level={user.level ?? 1} />
                {xpGain !== null && (
                  <XpFloatingFeedback
                    amount={xpGain}
                    onComplete={() => setXpGain(null)}
                  />
                )}
              </View>
            )}

            <View>
              <Text
                className="font-medium text-xs"
                style={{ color: colors.textSecondary }}
              >
                {greeting}, Curator
              </Text>
              <Text
                className="mt-px font-bold text-xl"
                style={{ color: colors.primary, letterSpacing: -0.5 }}
              >
                @{user?.username ?? "reader"}
              </Text>
            </View>
          </View>

          {/* Streak pill */}
          {!loadingStreak && (
            <View
              className="flex-row items-center gap-1 px-3 py-1.5 rounded-full"
              style={{ backgroundColor: colors.secondary + "2E" }}
            >
              <Text className="text-base">{"\uD83D\uDD25"}</Text>
              <Text
                className="font-bold text-sm"
                style={{ color: colors.secondary }}
              >
                {currentStreak} days
              </Text>
            </View>
          )}
        </Animated.View>

        <View className="gap-10">
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
            <TouchableOpacity
              onPress={() => router.push("/analytics")}
              className="flex-row justify-center items-center gap-2 mt-4 py-3.5 rounded-xl"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="font-bold text-[15px] text-white">
                View Complete Reading Analysis
              </Text>
              <Text className="text-white text-base">→</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity
              onPress={async () => {
                try {
                  if (!user?.email) {
                    Alert.alert("Error", "User email not found");
                    return;
                  }
                  await sendTestEmail(user.email, "Test Email from My Library");
                  Alert.alert("Success", "Email sent successfully!");
                } catch (error) {
                  Alert.alert("Error", "Failed to send email");
                  console.error(error);
                }
              }}
              className="items-center mt-3 py-3.5 border rounded-xl"
              style={{
                backgroundColor: colors.secondary + "20",
                borderColor: colors.secondary,
              }}
            >
              <Text
                className="font-bold text-sm"
                style={{ color: colors.secondary }}
              >
                Send Test Email 📧
              </Text>
            </TouchableOpacity> */}
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
