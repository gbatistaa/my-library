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
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<"stopwatch" | "timer">("stopwatch");
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
          if (mode === "timer" && next >= targetTime) {
            handleCompleteTimer(next);
            return next;
          }
          if (mode === "stopwatch" && next >= 10 * 3600) {
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
  }, [isActive, mode, targetTime, handleCompleteTimer]);

  const handleToggleTimer = () => {
    if (!isActive) {
      if (mode === "timer" && targetTime <= 0) {
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
    mode === "timer" && isActive ? Math.max(0, targetTime - elapsed) : elapsed;

  // Ring progress: stopwatch pulses slowly, timer fills toward completion
  const ringProgress =
    mode === "timer"
      ? targetTime > 0
        ? Math.min(elapsed / targetTime, 1)
        : 0
      : elapsed > 0
        ? Math.min(elapsed / 3600, 1) // fills over 1 hour for stopwatch
        : 0;

  const timerSubtitle =
    mode === "timer" && !isActive && elapsed === 0
      ? `${Math.floor(targetTime / 60)} min session`
      : mode === "stopwatch" && !isActive && elapsed === 0
        ? "Tap play to start"
        : undefined;

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
        {/* ── Header ───────────────────────────── */}
        <Animated.View
          entering={FadeIn.duration(400)}
          style={{ paddingTop: 14, paddingBottom: 8 }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: colors.text,
              letterSpacing: -0.5,
            }}
          >
            Reading Session
          </Text>
        </Animated.View>

        {/* ── Mode Toggle ──────────────────────── */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.surface,
            borderRadius: 12,
            marginTop: 20,
            padding: 4,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {(["stopwatch", "timer"] as const).map((m) => (
            <TouchableOpacity
              key={m}
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: "center",
                backgroundColor: mode === m ? colors.primary : "transparent",
                borderRadius: 8,
              }}
              onPress={() => {
                if (isActive) {
                  Alert.alert(
                    "Pause First",
                    "Pause the timer to switch modes.",
                  );
                  return;
                }
                setMode(m);
                setElapsed(0);
              }}
            >
              <Text
                style={{
                  color: mode === m ? "#FFFFFF" : colors.textSecondary,
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                {m === "stopwatch" ? "Stopwatch" : "Timer"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Book Selector ────────────────────── */}
        <TouchableOpacity
          onPress={() => setBookModalVisible(true)}
          activeOpacity={0.8}
          style={{
            marginTop: 24,
            height: 56,
            borderRadius: 14,
            backgroundColor: selectedBook
              ? colors.primary + "10"
              : colors.primary,
            borderWidth: 2,
            borderColor: colors.primary,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            justifyContent: "space-between",
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: selectedBook ? 0 : 0.2,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Feather
              name={selectedBook ? "book-open" : "plus-circle"}
              size={20}
              color={selectedBook ? colors.primary : "#FFFFFF"}
            />
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: selectedBook ? colors.primary : "#FFFFFF",
              }}
            >
              {selectedBook ? selectedBook.title : "Select your book reading"}
            </Text>
          </View>
          <Feather
            name="chevron-right"
            size={18}
            color={selectedBook ? colors.primary : "#FFFFFF"}
          />
        </TouchableOpacity>

        {/* ── Timer Ring ───────────────────────── */}
        <View style={{ alignItems: "center", marginTop: 40, marginBottom: 16 }}>
          <TimerRing
            progress={ringProgress}
            timeDisplay={formatTime(displaySeconds)}
            subtitle={timerSubtitle}
            isActive={isActive}
          />
        </View>

        {/* ── Timer Presets (timer mode only) ──── */}
        {mode === "timer" && !isActive && elapsed === 0 && (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 10,
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
                    paddingHorizontal: 15,
                    borderRadius: 12,
                    backgroundColor: isSelected
                      ? colors.primary
                      : colors.surface,
                    borderWidth: 2,
                    borderColor: isSelected ? colors.primary : colors.border,
                    minWidth: 64,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "800",
                      color: isSelected ? "#FFFFFF" : colors.text,
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
                paddingHorizontal: 15,
                borderRadius: 12,
                backgroundColor: colors.surface,
                borderWidth: 2,
                borderColor: colors.border,
                minWidth: 70,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "800",
                  color: colors.textSecondary,
                  textAlign: "center",
                }}
              >
                Custom
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ── Controls ─────────────────────────── */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 20,
            marginBottom: 48,
          }}
        >
          {/* Discard */}
          {elapsed > 0 && !isActive && (
            <Animated.View entering={FadeIn.duration(200)}>
              <TouchableOpacity
                onPress={() => {
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
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Feather name="x" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Play / Pause */}
          <TouchableOpacity
            onPress={handleToggleTimer}
            activeOpacity={0.8}
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: isActive ? colors.text : colors.primary,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: isActive ? "#000" : colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <Feather
              name={isActive ? "pause" : "play"}
              size={28}
              color={isActive ? colors.background : "#FFFFFF"}
            />
          </TouchableOpacity>

          {/* Save */}
          {elapsed >= 30 && !isActive && (
            <Animated.View entering={FadeIn.duration(200)}>
              <TouchableOpacity
                onPress={() => handleSaveSession()}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: colors.success,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: colors.success,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Feather name="check" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        {/* ── Recent Sessions ──────────────────── */}
        <View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: colors.textSecondary,
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              Recent Sessions
            </Text>
            <TouchableOpacity onPress={() => router.push("/session-history")}>
              <Text
                style={{
                  color: colors.primary,
                  fontWeight: "600",
                  fontSize: 13,
                }}
              >
                See all
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
            <View style={{ gap: 1 }}>
              {recentSessions.map((session, index) => (
                <Animated.View
                  key={session.id}
                  entering={FadeInDown.delay(index * 60)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 14,
                    borderBottomWidth:
                      index < recentSessions.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border + "60",
                  }}
                >
                  {/* Icon */}
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: colors.primary + "10",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Feather
                      name="book-open"
                      size={16}
                      color={colors.primary}
                    />
                  </View>

                  {/* Info */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontWeight: "600",
                        color: colors.text,
                        fontSize: 15,
                      }}
                      numberOfLines={1}
                    >
                      {session.bookTitle ?? "Unknown Book"}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 12,
                        marginTop: 3,
                      }}
                    >
                      <Text
                        style={{ color: colors.textSecondary, fontSize: 13 }}
                      >
                        {Math.ceil(session.durationSeconds / 60)} min
                      </Text>
                      <Text
                        style={{ color: colors.textSecondary, fontSize: 13 }}
                      >
                        {session.pagesRead} pages
                      </Text>
                    </View>
                  </View>

                  {/* Date */}
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textSecondary,
                      marginLeft: 8,
                    }}
                  >
                    {formatRelativeDate(session.createdAt)}
                  </Text>
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Book Selection Modal (Pattern as requested) ───── */}
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
