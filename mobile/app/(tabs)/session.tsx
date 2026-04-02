import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Animated as RNAnimated,
} from "react-native";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { useAppTheme } from "@/src/hooks/useAppTheme";
import { getCurrentlyReadingBooks } from "@/src/services/bookService";
import {
  submitReadingSession,
  fetchRecentReadingSessions,
} from "@/src/services/readingSessionService";
import { showApiError } from "@/src/services/apiError";
import { TimerRing } from "@/src/components/session/TimerRing";
import type { BookDTO } from "@/src/types/book";

function formatTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const TIMER_PRESETS = [15, 30, 45, 60] as const;

const SessionScreen = () => {
  const { colors, mode } = useAppTheme();
  const isDark = mode === "dark";
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [modeState, setModeState] = useState<"stopwatch" | "timer">(
    "stopwatch",
  );
  const [bookModalVisible, setBookModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookDTO | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [targetTime, setTargetTime] = useState(30 * 60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const SHEET_HEIGHT = 650;
  const slideAnim = useRef(new RNAnimated.Value(SHEET_HEIGHT)).current;
  const overlayAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (bookModalVisible) {
      RNAnimated.parallel([
        RNAnimated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          stiffness: 200,
        }),
        RNAnimated.timing(overlayAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      RNAnimated.parallel([
        RNAnimated.timing(slideAnim, {
          toValue: SHEET_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
        RNAnimated.timing(overlayAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [bookModalVisible, overlayAnim, slideAnim, SHEET_HEIGHT]);

  const closeBookModal = useCallback(() => setBookModalVisible(false), []);

  const { data: readingBooks } = useQuery({
    queryKey: ["currentlyReadingSelection"],
    queryFn: async () => {
      const page = await getCurrentlyReadingBooks();
      return page.content ?? [];
    },
  });

  const { data: recentSessions, refetch: refetchRecentSessions } = useQuery({
    queryKey: ["recentSessions"],
    queryFn: fetchRecentReadingSessions,
  });

  const { mutate: createSession } = useMutation({
    mutationFn: submitReadingSession,
    onSuccess: () => {
      Alert.alert("Session Saved", "Your reading session has been recorded.");
      setElapsed(0);
      setIsActive(false);
      refetchRecentSessions();
      queryClient.invalidateQueries({ queryKey: ["currentlyReading"] });
      queryClient.invalidateQueries({ queryKey: ["dna"] });
      queryClient.invalidateQueries({ queryKey: ["goalProgress"] });
    },
    onError: (err: unknown) => {
      showApiError("Failed to save session", err);
    },
  });

  const handleSaveSession = useCallback(
    (overrideElapsed?: number) => {
      setIsActive(false);
      const duration = overrideElapsed ?? elapsed;
      if (duration < 30) {
        Alert.alert("Too Short", "Sessions must be at least 30 seconds.");
        return;
      }
      if (!selectedBook) {
        Alert.alert("Select a Book", "Pick the book you were reading first.");
        setBookModalVisible(true);
        return;
      }
      Alert.prompt(
        "Pages Read",
        "How many pages did you read this session?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Save",
            onPress: (val?: string) => {
              const num = parseInt(val || "0", 10);
              if (num <= 0) {
                Alert.alert("Invalid", "Enter a valid number of pages.");
                return;
              }
              createSession({
                bookId: selectedBook.id,
                durationSeconds: duration,
                pagesRead: num,
              });
            },
          },
        ],
        "plain-text",
        "1",
        "number-pad",
      );
    },
    [elapsed, selectedBook, createSession],
  );

  const handleCompleteTimer = useCallback(
    (finalElapsed: number) => {
      setIsActive(false);
      if (!selectedBook) {
        Alert.alert(
          "Time's Up!",
          "Select a book and save to record this session.",
        );
        return;
      }
      Alert.alert("Time's Up!", "Great reading session. Save it now?", [
        { text: "Discard", style: "cancel" },
        { text: "Save", onPress: () => handleSaveSession(finalElapsed) },
      ]);
    },
    [selectedBook, handleSaveSession],
  );

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          if (modeState === "timer" && next >= targetTime) {
            handleCompleteTimer(next);
            return next;
          }
          if (modeState === "stopwatch" && next >= 10 * 3600) {
            setIsActive(false);
            Alert.alert("Limit", "Maximum session length is 10 hours.");
          }
          return next;
        });
      }, 1000);
    } else if (!isActive && timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, modeState, targetTime, handleCompleteTimer]);

  const handleToggleTimer = () => {
    if (!isActive) {
      if (modeState === "timer" && targetTime <= 0) {
        Alert.alert("Set a Duration", "Choose how long you want to read.");
        return;
      }
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  };

  const displaySeconds =
    modeState === "timer" && isActive
      ? Math.max(0, targetTime - elapsed)
      : elapsed;
  const ringProgress =
    modeState === "timer"
      ? targetTime > 0
        ? Math.min(elapsed / targetTime, 1)
        : 0
      : elapsed > 0
        ? Math.min(elapsed / 3600, 1)
        : 0;
  const timerSubtitle =
    modeState === "timer" && !isActive && elapsed === 0
      ? `${Math.floor(targetTime / 60)} min session`
      : modeState === "stopwatch" && !isActive && elapsed === 0
        ? "Tap play to start"
        : undefined;
  const canDiscard = elapsed > 0 && !isActive;
  const canSave = elapsed >= 30 && !isActive;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 48,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* -- Header -------------------------------- */}
        <Animated.View entering={FadeIn.duration(400)} className="pt-3.5 pb-2">
          <Text
            className="font-extrabold text-[28px] tracking-[-0.5px]"
            style={{ color: colors.text }}
          >
            Reading Session
          </Text>
        </Animated.View>

        {/* -- Mode Toggle --------------------------- */}
        <View className="self-center mt-5 w-full">
          <View
            className="flex-row p-1.5 rounded-xl w-full"
            style={{
              backgroundColor: colors.surfaceContainerLow,
              ...(isDark && {
                borderWidth: 1,
                borderColor: colors.outlineVariant + "4D",
              }),
            }}
          >
            {(["stopwatch", "timer"] as const).map((m) => {
              const isSelected = modeState === m;
              return (
                <TouchableOpacity
                  key={m}
                  className="flex-1 items-center py-3 rounded-[10px]"
                  style={{
                    backgroundColor: isSelected
                      ? colors.primary
                      : "transparent",
                    ...(isSelected && {
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 2,
                    }),
                  }}
                  onPress={() => {
                    if (isActive) {
                      Alert.alert(
                        "Pause First",
                        "Pause the timer to switch modes.",
                      );
                      return;
                    }
                    setModeState(m);
                    setElapsed(0);
                  }}
                >
                  <Text
                    className="text-sm"
                    style={{
                      color: isSelected
                        ? colors.onPrimary
                        : colors.textSecondary,
                      fontWeight: isSelected ? "600" : "500",
                    }}
                  >
                    {m === "stopwatch" ? "Stopwatch" : "Timer"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* -- Book Selector ------------------------- */}
        <View className="mt-8 mb-8">
          {selectedBook ? (
            /* ── With book: glassmorphism card ── */
            <Pressable
              onPress={() => setBookModalVisible(true)}
              className="flex-row justify-between items-center bg-white/65 dark:bg-[#1E293B]/60 shadow-black/[0.08] shadow-lg dark:shadow-black/30 px-4 py-3.5 border border-[#6b38d4]/[0.12] dark:border-[#A78BFA]/[0.18] rounded-2xl active:scale-[0.98]"
              style={{ elevation: 4 }}
            >
              {/* Thumbnail */}
              <View className="justify-center items-center bg-[#6b38d4]/[0.09] dark:bg-[#A78BFA]/[0.15] rounded-lg w-12 h-16">
                <Feather name="book" size={20} color={colors.primary} />
              </View>

              {/* Info */}
              <View className="flex-1 justify-center ml-3.5">
                <Text
                  className="mb-1 font-bold text-[#111c2d] dark:text-[#F8FAFC] text-base"
                  numberOfLines={1}
                >
                  {selectedBook.title}
                </Text>
                <Text
                  className="font-medium text-[#494454] text-[13px] dark:text-[#94A3B8]"
                  numberOfLines={1}
                >
                  {selectedBook.author || "Unknown Author"} •{" "}
                  {selectedBook.pages || 0} pages
                </Text>
              </View>

              <Feather
                name="chevron-right"
                size={20}
                color={colors.textSecondary}
              />
            </Pressable>
          ) : (
            /* ── Empty: solid purple button ── */
            <Pressable
              onPress={() => setBookModalVisible(true)}
              className="flex-row justify-center items-center gap-2.5 bg-[#6b38d4] active:bg-[#6b38d4]/80 dark:active:bg-[#A78BFA]/80 dark:bg-[#A78BFA] shadow-[#6b38d4]/35 shadow-lg dark:shadow-[#A78BFA]/35 rounded-[14px] h-14 active:scale-[0.97]"
              style={{ elevation: 6 }}
            >
              <Feather name="plus-circle" size={20} color="#FFFFFF" />
              <Text className="font-bold text-white text-base tracking-[0.2px]">
                Select a book to read
              </Text>
            </Pressable>
          )}
        </View>

        {/* -- Timer Ring ---------------------------- */}
        <View className="items-center mb-4">
          <TimerRing
            progress={ringProgress}
            timeDisplay={formatTime(displaySeconds)}
            subtitle={timerSubtitle}
            isActive={isActive}
          />
        </View>

        {/* -- Timer Presets (timer mode only) ------- */}
        {modeState === "timer" && !isActive && elapsed === 0 && (
          <Animated.View
            entering={FadeIn.duration(300)}
            className="flex-row flex-wrap justify-center gap-3 mb-6"
          >
            {TIMER_PRESETS.map((mins) => {
              const isSelected = targetTime === mins * 60;
              return (
                <TouchableOpacity
                  key={mins}
                  onPress={() => setTargetTime(mins * 60)}
                  activeOpacity={0.7}
                  className="justify-center items-center px-5 py-2.5 rounded-full"
                  style={{
                    backgroundColor: isSelected
                      ? isDark
                        ? colors.primary
                        : colors.primaryFixed
                      : colors.surfaceContainerLow,
                    ...(!isSelected &&
                      isDark && {
                        borderWidth: 1,
                        borderColor: colors.outlineVariant + "4D",
                      }),
                  }}
                >
                  <Text
                    className="text-sm text-center"
                    style={{
                      fontWeight: isSelected ? "700" : "500",
                      color: isSelected
                        ? isDark
                          ? colors.onPrimary
                          : colors.onPrimaryFixedVariant
                        : colors.textSecondary,
                    }}
                  >
                    {mins}m
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              onPress={() => {
                Alert.prompt(
                  "Custom Duration",
                  "Enter minutes:",
                  (val) => {
                    const n = parseInt(val || "0", 10);
                    if (n > 0) setTargetTime(n * 60);
                  },
                  "plain-text",
                  "",
                  "number-pad",
                );
              }}
              activeOpacity={0.7}
              className="flex-row justify-center items-center gap-1.5 px-5 py-2.5 rounded-full"
              style={{
                backgroundColor: colors.surfaceContainerLow,
                ...(isDark && {
                  borderWidth: 1,
                  borderColor: colors.outlineVariant + "4D",
                }),
              }}
            >
              <Feather name="edit-2" size={12} color={colors.textSecondary} />
              <Text
                className="font-medium text-sm text-center"
                style={{ color: colors.textSecondary }}
              >
                Custom
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* -- Controls ------------------------------ */}
        <View className="flex-row justify-center items-center gap-12 mb-12">
          {/* Cancel (X) */}
          <TouchableOpacity
            onPress={() => {
              if (!canDiscard) return;
              Alert.alert(
                "Discard Session?",
                "This will reset your progress.",
                [
                  { text: "Keep", style: "cancel" },
                  {
                    text: "Discard",
                    style: "destructive",
                    onPress: () => setElapsed(0),
                  },
                ],
              );
            }}
            activeOpacity={canDiscard ? 0.7 : 1}
            className="justify-center items-center rounded-full w-14 h-14"
            style={{
              backgroundColor: colors.surfaceContainerLow,
              opacity: canDiscard ? 1 : 0.35,
              ...(isDark && {
                borderWidth: 1,
                borderColor: colors.outlineVariant + "80",
              }),
            }}
          >
            <Feather name="x" size={22} color={colors.error} />
          </TouchableOpacity>

          {/* Play / Pause */}
          <TouchableOpacity
            onPress={handleToggleTimer}
            activeOpacity={0.8}
            className="justify-center items-center rounded-full w-[72px] h-[72px]"
            style={{
              backgroundColor: colors.primary,
              transform: [{ scale: 1.1 }],
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Feather
              name={isActive ? "pause" : "play"}
              size={28}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {/* Save (check) */}
          <TouchableOpacity
            onPress={() => {
              if (!canSave) return;
              handleSaveSession();
            }}
            activeOpacity={canSave ? 0.7 : 1}
            className="justify-center items-center rounded-full w-14 h-14"
            style={{
              backgroundColor: colors.surfaceContainerLow,
              opacity: canSave ? 1 : 0.35,
              ...(isDark && {
                borderWidth: 1,
                borderColor: colors.outlineVariant + "80",
              }),
            }}
          >
            <Feather
              name="check"
              size={22}
              color={isDark ? colors.primary : colors.secondary}
            />
          </TouchableOpacity>
        </View>

        {/* -- Recent Sessions ----------------------- */}
        <View>
          <View className="flex-row justify-between items-baseline mb-4">
            <Text
              className="font-bold text-[18px]"
              style={{ color: colors.text }}
            >
              Recent Sessions
            </Text>
            <TouchableOpacity onPress={() => router.push("/session-history")}>
              <Text
                className="font-medium text-[13px]"
                style={{ color: colors.primary }}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {!Array.isArray(recentSessions) || recentSessions.length === 0 ? (
            <View className="py-5">
              <Text
                className="text-sm leading-5"
                style={{ color: colors.textSecondary }}
              >
                No sessions yet. Start your first reading session above!
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {recentSessions.map((session, index) => (
                <Animated.View
                  key={session.id}
                  entering={FadeInDown.delay(index * 60)}
                  className="flex-row items-center p-4 rounded-lg"
                  style={{
                    backgroundColor: isDark
                      ? colors.surfaceContainerLow
                      : colors.surface,
                    ...(isDark && {
                      borderWidth: 1,
                      borderColor: colors.outlineVariant + "4D",
                    }),
                  }}
                >
                  {/* Thumbnail */}
                  <View
                    className="justify-center items-center mr-3 rounded-md w-12 h-16"
                    style={{ backgroundColor: colors.surfaceContainerHigh }}
                  >
                    <Feather
                      name="book-open"
                      size={18}
                      color={colors.textSecondary}
                    />
                  </View>

                  {/* Info */}
                  <View className="flex-1">
                    <Text
                      className="font-bold text-[15px]"
                      style={{ color: colors.text }}
                      numberOfLines={1}
                    >
                      {session.bookTitle ?? "Unknown Book"}
                    </Text>
                    <Text
                      className="mt-1 text-xs"
                      style={{ color: colors.textSecondary }}
                    >
                      {formatRelativeDate(session.createdAt)} {"\u2022"}{" "}
                      {Math.ceil(session.durationSeconds / 60)}m session
                    </Text>
                  </View>

                  {/* Points badge */}
                  <View
                    className="px-2.5 py-[5px] rounded-full"
                    style={{
                      backgroundColor: isDark
                        ? colors.surfaceContainerHigh
                        : colors.secondaryFixed,
                      ...(isDark && {
                        borderWidth: 1,
                        borderColor: colors.primary + "33",
                      }),
                    }}
                  >
                    <Text
                      className="font-bold text-xs"
                      style={{
                        color: isDark
                          ? colors.primaryContainer
                          : colors.secondary,
                      }}
                    >
                      +{session.pagesRead} pts
                    </Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* -- Book Selection Modal ------------------- */}
      <View
        style={{ ...StyleSheet.absoluteFillObject, zIndex: 999 }}
        pointerEvents={bookModalVisible ? "auto" : "none"}
      >
        {/* Backdrop */}
        <RNAnimated.View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.5)",
            opacity: overlayAnim,
          }}
        >
          <Pressable
            className="flex-1"
            onPress={() => setBookModalVisible(false)}
          />
        </RNAnimated.View>

        {/* Sheet */}
        <RNAnimated.View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.background,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            minHeight: "65%",
            maxHeight: "85%",
            paddingTop: 20,
            paddingHorizontal: 24,
            paddingBottom: insets.bottom + 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 24,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Handle pill */}
          <View
            className="self-center mb-6 rounded-full w-10 h-[5px]"
            style={{ backgroundColor: colors.border }}
          />

          <View className="flex-row justify-between items-center mb-5">
            <Text
              className="font-extrabold text-2xl tracking-[-0.5px]"
              style={{ color: colors.text }}
            >
              Choose a Book
            </Text>
            <TouchableOpacity
              onPress={closeBookModal}
              className="justify-center items-center rounded-full w-9 h-9"
              style={{ backgroundColor: colors.surface }}
            >
              <Feather name="x" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {!readingBooks || readingBooks.length === 0 ? (
            <View className="flex-1 justify-center items-center pb-10">
              <Feather
                name="book"
                size={48}
                color={colors.border}
                style={{ marginBottom: 16 }}
              />
              <Text
                className="max-w-[80%] text-base text-center"
                style={{ color: colors.textSecondary }}
              >
                {
                  "No books currently being read.\nAdd one to your library first!"
                }
              </Text>
            </View>
          ) : (
            <FlatList
              data={readingBooks}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => {
                const isSelected = selectedBook?.id === item.id;
                return (
                  <View className="mb-4">
                    <Pressable
                      className="flex-row items-center gap-4 p-4 rounded-[20px]"
                      style={({ pressed }) => ({
                        backgroundColor: isSelected
                          ? colors.primary + "15"
                          : colors.surface,
                        borderWidth: 2,
                        borderColor: isSelected
                          ? colors.primary
                          : colors.border + "40",
                        opacity: pressed ? 0.8 : 1,
                      })}
                      onPress={() => {
                        setSelectedBook(item);
                        setBookModalVisible(false);
                      }}
                    >
                      <View
                        className="justify-center items-center rounded-xl w-[50px] h-[70px]"
                        style={{ backgroundColor: colors.primary + "15" }}
                      >
                        <Feather name="book" size={24} color={colors.primary} />
                      </View>

                      <View className="flex-1">
                        <Text
                          className="font-extrabold text-[17px]"
                          style={{ color: colors.text }}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <Text
                          className="mt-[3px] font-medium text-sm"
                          style={{ color: colors.textSecondary }}
                          numberOfLines={1}
                        >
                          {item.author}
                        </Text>
                        <View className="flex-row items-center gap-1.5 mt-2">
                          <View
                            className="px-2 py-0.5 rounded-[4px]"
                            style={{ backgroundColor: colors.primary + "10" }}
                          >
                            <Text
                              className="font-bold text-[11px]"
                              style={{ color: colors.primary }}
                            >
                              {item.pages} pgs
                            </Text>
                          </View>
                          {item.genre && (
                            <Text
                              className="text-[13px]"
                              style={{ color: colors.textSecondary }}
                            >
                              • {item.genre}
                            </Text>
                          )}
                        </View>
                      </View>

                      {isSelected && (
                        <View
                          className="p-1.5 rounded-xl"
                          style={{ backgroundColor: colors.primary }}
                        >
                          <Feather name="check" size={16} color="#FFF" />
                        </View>
                      )}
                    </Pressable>
                  </View>
                );
              }}
            />
          )}
        </RNAnimated.View>
      </View>
    </View>
  );
};

export default SessionScreen;
