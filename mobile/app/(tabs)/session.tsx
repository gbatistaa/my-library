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
  const [targetTime, setTargetTime] = useState(30 * 60); // default 30 min
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Custom Animation Pattern from User
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

  const closeBookModal = useCallback(() => {
    setBookModalVisible(false);
  }, []);

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
    onError: (err: any) => {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to save session.",
      );
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
            onPress: (val: string | undefined) => {
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

  // Calculate display values
  const displaySeconds =
    modeState === "timer" && isActive
      ? Math.max(0, targetTime - elapsed)
      : elapsed;

  // Ring progress: stopwatch pulses slowly, timer fills toward completion
  const ringProgress =
    modeState === "timer"
      ? targetTime > 0
        ? Math.min(elapsed / targetTime, 1)
        : 0
      : elapsed > 0
        ? Math.min(elapsed / 3600, 1) // fills over 1 hour for stopwatch
        : 0;

  const timerSubtitle =
    modeState === "timer" && !isActive && elapsed === 0
      ? `${Math.floor(targetTime / 60)} min session`
      : modeState === "stopwatch" && !isActive && elapsed === 0
        ? "Tap play to start"
        : undefined;

  // Whether cancel/save should be functional
  const canDiscard = elapsed > 0 && !isActive;
  const canSave = elapsed >= 30 && !isActive;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 48,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* -- Header -------------------------------- */}
        <Animated.View
          entering={FadeIn.duration(400)}
          style={{ paddingTop: 14, paddingBottom: 8 }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: colors.primary,
              letterSpacing: -0.3,
            }}
          >
            Reading Session
          </Text>
        </Animated.View>

        {/* -- Mode Toggle --------------------------- */}
        <View
          style={{
            alignSelf: "center",
            maxWidth: 280,
            width: "100%",
            marginTop: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              backgroundColor: colors.surfaceContainerLow,
              borderRadius: 12,
              padding: 6,
              ...(isDark && {
                borderWidth: 1,
                borderColor: colors.outlineVariant + "4D", // 30% opacity
              }),
            }}
          >
            {(["stopwatch", "timer"] as const).map((m) => {
              const isSelected = modeState === m;
              return (
                <TouchableOpacity
                  key={m}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    alignItems: "center",
                    backgroundColor: isSelected
                      ? colors.primary
                      : "transparent",
                    borderRadius: 10,
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
                    style={{
                      color: isSelected
                        ? colors.onPrimary
                        : colors.textSecondary,
                      fontWeight: isSelected ? "600" : "500",
                      fontSize: 14,
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
        <Pressable
          onPress={() => setBookModalVisible(true)}
          style={({ pressed }) => ({
            marginTop: 24,
            height: 56,
            borderRadius: 8,
            backgroundColor: isDark
              ? colors.surfaceContainerLow
              : colors.primaryContainer,
            ...(isDark && {
              borderWidth: 1,
              borderColor: colors.outlineVariant + "4D",
            }),
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            justifyContent: "space-between",
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <View
            style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
          >
            {/* Book cover thumbnail placeholder */}
            <View
              style={{
                width: 32,
                height: 40,
                borderRadius: 4,
                backgroundColor: isDark
                  ? colors.surface + "80"
                  : colors.onPrimary + "40",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather
                name="book"
                size={16}
                color={
                  isDark ? colors.textSecondary : colors.onPrimaryFixedVariant
                }
              />
            </View>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: isDark ? colors.text : colors.onPrimaryFixedVariant,
              }}
              numberOfLines={1}
            >
              {selectedBook ? selectedBook.title : "Select your book"}
            </Text>
          </View>
          <Feather
            name="chevron-right"
            size={18}
            color={isDark ? colors.textSecondary : colors.onPrimaryFixedVariant}
          />
        </Pressable>

        {/* -- Timer Ring ---------------------------- */}
        <View style={{ alignItems: "center", marginTop: 40, marginBottom: 16 }}>
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
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {TIMER_PRESETS.map((mins) => {
              const isSelected = targetTime === mins * 60;
              return (
                <TouchableOpacity
                  key={mins}
                  onPress={() => setTargetTime(mins * 60)}
                  activeOpacity={0.7}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 999,
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
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: isSelected ? "700" : "500",
                      color: isSelected
                        ? isDark
                          ? colors.onPrimary
                          : colors.onPrimaryFixedVariant
                        : colors.textSecondary,
                      textAlign: "center",
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
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 999,
                backgroundColor: colors.surfaceContainerLow,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                ...(isDark && {
                  borderWidth: 1,
                  borderColor: colors.outlineVariant + "4D",
                }),
              }}
            >
              <Feather name="edit-2" size={12} color={colors.textSecondary} />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: colors.textSecondary,
                  textAlign: "center",
                }}
              >
                Custom
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* -- Controls ------------------------------ */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 48,
            marginBottom: 48,
          }}
        >
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
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.surfaceContainerLow,
              justifyContent: "center",
              alignItems: "center",
              opacity: canDiscard ? 1 : 0.35,
              ...(isDark && {
                borderWidth: 1,
                borderColor: colors.outlineVariant + "80", // 50% opacity
              }),
            }}
          >
            <Feather name="x" size={22} color={colors.error} />
          </TouchableOpacity>

          {/* Play / Pause */}
          <TouchableOpacity
            onPress={handleToggleTimer}
            activeOpacity={0.8}
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: colors.primary,
              justifyContent: "center",
              alignItems: "center",
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
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.surfaceContainerLow,
              justifyContent: "center",
              alignItems: "center",
              opacity: canSave ? 1 : 0.35,
              ...(isDark && {
                borderWidth: 1,
                borderColor: colors.outlineVariant + "80", // 50% opacity
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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: colors.text,
              }}
            >
              Recent Sessions
            </Text>
            <TouchableOpacity onPress={() => router.push("/session-history")}>
              <Text
                style={{
                  color: colors.primary,
                  fontWeight: "500",
                  fontSize: 13,
                }}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {!Array.isArray(recentSessions) || recentSessions.length === 0 ? (
            <View style={{ paddingVertical: 20 }}>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 14,
                  lineHeight: 20,
                }}
              >
                No sessions yet. Start your first reading session above!
              </Text>
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              {recentSessions.map((session, index) => (
                <Animated.View
                  key={session.id}
                  entering={FadeInDown.delay(index * 60)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 16,
                    borderRadius: 8,
                    backgroundColor: isDark
                      ? colors.surfaceContainerLow
                      : colors.surface,
                    ...(isDark && {
                      borderWidth: 1,
                      borderColor: colors.outlineVariant + "4D", // 30% opacity
                    }),
                  }}
                >
                  {/* Book cover thumbnail */}
                  <View
                    style={{
                      width: 48,
                      height: 64,
                      borderRadius: 6,
                      backgroundColor: colors.surfaceContainerHigh,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Feather
                      name="book-open"
                      size={18}
                      color={colors.textSecondary}
                    />
                  </View>

                  {/* Info */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontWeight: "700",
                        color: colors.text,
                        fontSize: 15,
                      }}
                      numberOfLines={1}
                    >
                      {session.bookTitle ?? "Unknown Book"}
                    </Text>
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      {formatRelativeDate(session.createdAt)} {"\u2022"}{" "}
                      {Math.ceil(session.durationSeconds / 60)}m session
                    </Text>
                  </View>

                  {/* Points badge */}
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 999,
                      backgroundColor: isDark
                        ? colors.surfaceContainerHigh
                        : colors.secondaryFixed,
                      ...(isDark && {
                        borderWidth: 1,
                        borderColor: colors.primary + "33", // 20% opacity
                      }),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
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

      {/* -- Book Selection Modal (kept exactly as-is) -- */}
      <View
        style={{ ...StyleSheet.absoluteFillObject, zIndex: 999 }}
        pointerEvents={bookModalVisible ? "auto" : "none"}
      >
        {/* Backdrop with FADE */}
        <RNAnimated.View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.5)",
            opacity: overlayAnim,
          }}
        >
          <Pressable
            style={{ flex: 1 }}
            onPress={() => setBookModalVisible(false)}
          />
        </RNAnimated.View>

        {/* Sheet with SLIDE (using Transform) */}
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
          {/* Handle / Pill */}
          <View
            style={{
              width: 40,
              height: 5,
              borderRadius: 2.5,
              backgroundColor: colors.border,
              alignSelf: "center",
              marginBottom: 24,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "800",
                color: colors.text,
                letterSpacing: -0.5,
              }}
            >
              Choose a Book
            </Text>
            <TouchableOpacity
              onPress={closeBookModal}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.surface,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name="x" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {!readingBooks || readingBooks.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingBottom: 40,
              }}
            >
              <Feather
                name="book"
                size={48}
                color={colors.border}
                style={{ marginBottom: 16 }}
              />
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 16,
                  textAlign: "center",
                  maxWidth: "80%",
                }}
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
                  <Pressable
                    style={({ pressed }) => ({
                      marginBottom: 16,
                      padding: 16,
                      borderRadius: 20,
                      backgroundColor: isSelected
                        ? colors.primary + "15"
                        : colors.surface,
                      borderWidth: 2,
                      borderColor: isSelected
                        ? colors.primary
                        : colors.border + "40",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 16,
                      opacity: pressed ? 0.8 : 1,
                    })}
                    onPress={() => {
                      setSelectedBook(item);
                      setBookModalVisible(false);
                    }}
                  >
                    <View
                      style={{
                        width: 50,
                        height: 70,
                        borderRadius: 10,
                        backgroundColor: colors.primary + "15",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Feather name="book" size={24} color={colors.primary} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: colors.text,
                          fontSize: 17,
                          fontWeight: "800",
                        }}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={{
                          color: colors.textSecondary,
                          fontSize: 14,
                          marginTop: 3,
                          fontWeight: "500",
                        }}
                        numberOfLines={1}
                      >
                        {item.author}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 8,
                          gap: 6,
                        }}
                      >
                        <View
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            backgroundColor: colors.primary + "10",
                            borderRadius: 4,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              color: colors.primary,
                              fontWeight: "700",
                            }}
                          >
                            {item.pages} pgs
                          </Text>
                        </View>
                        {item.genre && (
                          <Text
                            style={{
                              fontSize: 13,
                              color: colors.textSecondary,
                            }}
                          >
                            • {item.genre}
                          </Text>
                        )}
                      </View>
                    </View>

                    {isSelected && (
                      <View
                        style={{
                          backgroundColor: colors.primary,
                          borderRadius: 12,
                          padding: 6,
                        }}
                      >
                        <Feather name="check" size={16} color="#FFF" />
                      </View>
                    )}
                  </Pressable>
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
