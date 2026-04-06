import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSetAtom } from "jotai";

import {
  getBookById,
  resetBookForReread,
  deleteBook,
} from "@/src/services/bookService";
import { showApiError } from "@/src/services/apiError";
import { pendingSessionBookAtom } from "@/src/store/session";
import type { BookStatus } from "@/src/types/book";
import { useAppTheme } from "@/src/hooks/useAppTheme";

/* ─── Helpers ─── */

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusLabel(status: BookStatus): string {
  switch (status) {
    case "READING":
      return "Reading Now";
    case "COMPLETED":
      return "Completed";
    case "DROPPED":
      return "Dropped";
    default:
      return "To Read";
  }
}

/* ─── Sub-components ─── */

function StarRating({ rating }: { rating: number | null }) {
  const filled = Math.round(rating ?? 0);
  return (
    <View className="flex-row gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <MaterialIcons
          key={i}
          name={i <= filled ? "star" : "star-border"}
          size={16}
          color={i <= filled ? "#F59E0B" : "#94A3B8"}
        />
      ))}
    </View>
  );
}

function InfoCard({
  label,
  value,
  icon,
  delay,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  delay: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(delay)}
      className="bg-slate-50 dark:bg-slate-900 shadow-slate-200/50 shadow-sm dark:shadow-none mb-4 p-5 border border-slate-100 dark:border-slate-800 rounded-3xl"
    >
      <Text className="mb-1.5 font-black text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[2px]">
        {label}
      </Text>
      <View className="flex-row items-center gap-3">
        {icon}
        <Text className="font-bold text-slate-900 dark:text-slate-50 text-base tracking-tight">
          {value}
        </Text>
      </View>
    </Animated.View>
  );
}

/* ─── Loading / Error States ─── */

function LoadingState() {
  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-slate-950">
      <ActivityIndicator size="large" color="#7c4dff" />
    </View>
  );
}

function ErrorState({ onBack }: { onBack: () => void }) {
  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-slate-950 px-8">
      <View className="items-center bg-red-50 dark:bg-red-900/10 p-6 border border-red-100 dark:border-red-900/20 rounded-[32px]">
        <Feather name="alert-circle" size={48} color="#ef4444" />
        <Text className="mt-4 font-bold text-slate-950 dark:text-slate-50 text-xl text-center">
          {"Couldn't load book"}
        </Text>
        <Text className="mt-2 text-slate-500 dark:text-slate-400 text-sm text-center leading-5">
          Something went wrong while fetching the details.
        </Text>
        <Pressable
          onPress={onBack}
          className="bg-slate-900 dark:bg-slate-50 shadow-lg mt-6 px-8 py-3.5 rounded-2xl active:scale-95"
        >
          <Text className="font-bold text-white dark:text-slate-950">
            Go Back
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ─── Main Screen ─── */

export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { mode, colors } = useAppTheme();

  const queryClient = useQueryClient();
  const setPendingBook = useSetAtom(pendingSessionBookAtom);

  const {
    data: book,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["book", id],
    queryFn: () => getBookById(id),
    enabled: !!id,
  });

  const { mutate: readAgain, isPending: isResetting } = useMutation({
    mutationFn: () => resetBookForReread(id),
    onSuccess: (updatedBook) => {
      setPendingBook(updatedBook);
      queryClient.invalidateQueries({ queryKey: ["book", id] });
      queryClient.invalidateQueries({
        queryKey: ["currentlyReadingSelection"],
      });
      router.push("/(tabs)/session");
    },
    onError: (err: unknown) => showApiError("Failed to reset book", err),
  });

  const { mutate: removeBook, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["currentlyReading"] });
      router.back();
    },
    onError: (err: unknown) => showApiError("Failed to delete book", err),
  });

  function handleDelete() {
    if (!book) return;
    Alert.alert(
      "Delete Book",
      `Are you sure you want to permanently delete "${book.title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => removeBook() },
      ],
    );
  }

  function handleContinueOrStartReading() {
    if (!book) return;
    setPendingBook(book);
    queryClient.invalidateQueries({ queryKey: ["currentlyReadingSelection"] });
    router.push("/(tabs)/session");
  }

  function handleReadAgain() {
    if (!book) return;
    Alert.alert(
      "Read Again",
      `"${book.title}" will be reset. Your progress and rating will be cleared. Are you sure?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset & Read",
          style: "destructive",
          onPress: () => readAgain(),
        },
      ],
    );
  }

  if (isLoading) return <LoadingState />;
  if (isError || !book) return <ErrorState onBack={() => router.back()} />;

  const progressPercentage =
    book.pages > 0
      ? Math.min(100, Math.floor(((book.pagesRead ?? 0) / book.pages) * 100))
      : 0;

  const coverWidth = width * 0.62;

  const getStatusColor = (status: BookStatus) => {
    switch (status) {
      case "READING":
        return "#F59E0B";
      case "COMPLETED":
        return "#10b981";
      case "DROPPED":
        return "#ef4444";
      default:
        return "#6366f1";
    }
  };

  const statusColor = getStatusColor(book.status);

  return (
    <>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-white dark:bg-slate-950">
        {/* Top Accent Gradient overlay */}
        <View className="top-0 right-0 left-0 absolute bg-violet-600/5 dark:bg-violet-500/5 h-64" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        >
          {/* ─── Top App Bar ─── */}
          <View
            className="flex-row justify-between items-center px-6 pb-4"
            style={{ paddingTop: insets.top + 8 }}
          >
            <Pressable
              onPress={() => router.back()}
              className="justify-center items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full w-10 h-10 active:scale-90"
              hitSlop={8}
            >
              <Feather name="arrow-left" size={20} color={colors.text} />
            </Pressable>

            <View className="flex-1 mx-4">
              <Text
                className="font-black text-slate-900 dark:text-slate-50 text-2xl text-center tracking-tight"
                numberOfLines={1}
              >
                {book.title}
              </Text>
            </View>

            <Pressable
              onPress={() => router.push(`/edit-book/${id}`)}
              className="justify-center items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full w-10 h-10 active:scale-90"
              hitSlop={8}
            >
              <Feather name="edit-3" size={18} color={colors.text} />
            </Pressable>
          </View>

          {/* ─── Cover Image ─── */}
          <Animated.View
            entering={FadeIn.duration(600)}
            className="self-center shadow-2xl mt-6 rounded-[32px] overflow-hidden"
            style={{
              width: coverWidth,
              aspectRatio: 2 / 3,
              shadowColor: mode === "dark" ? "#000" : "#6b38d4",
              elevation: 25,
            }}
          >
            {book.coverUrl ? (
              <Image
                source={{ uri: book.coverUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="justify-center items-center bg-slate-200 dark:bg-slate-900 w-full h-full">
                <Text className="text-8xl">📖</Text>
              </View>
            )}
          </Animated.View>

          <View className="px-6">
            {/* ─── Metadata Header ─── */}
            <Animated.View
              entering={FadeInDown.duration(400).delay(100)}
              className="mt-10"
            >
              {/* Status badge + rating row */}
              <View className="flex-row justify-between items-center mb-4">
                <View
                  className="px-3 py-1 border rounded-full"
                  style={{
                    backgroundColor: `${statusColor}15`,
                    borderColor: `${statusColor}30`,
                  }}
                >
                  <Text
                    className="font-black text-[10px] uppercase tracking-[1px]"
                    style={{ color: statusColor }}
                  >
                    {getStatusLabel(book.status)}
                  </Text>
                </View>
                <StarRating rating={book.rating} />
              </View>

              <Text className="font-black text-slate-950 dark:text-slate-50 text-4xl leading-tight tracking-tight">
                {book.title}
              </Text>
              <Text className="mt-2.5 font-medium text-slate-500 dark:text-slate-400 text-xl italic">
                {book.author}
              </Text>
            </Animated.View>

            {/* Category Tags */}
            {book.categories && book.categories.length > 0 && (
              <Animated.View
                entering={FadeInDown.duration(400).delay(150)}
                className="flex-row flex-wrap gap-2.5 mt-6"
              >
                {book.categories.map((cat, i) => (
                  <View
                    key={`${cat.name}-${i}`}
                    className="shadow-sm px-4 py-2 border rounded-xl"
                    style={{
                      backgroundColor: cat.color
                        ? `${cat.color}10`
                        : "rgba(107, 56, 212, 0.05)",
                      borderColor: cat.color
                        ? `${cat.color}30`
                        : "rgba(107, 56, 212, 0.2)",
                    }}
                  >
                    <Text
                      className="font-bold text-[13px]"
                      style={{ color: cat.color ? cat.color : "#6d28d9" }}
                    >
                      {cat.name}
                    </Text>
                  </View>
                ))}
              </Animated.View>
            )}

            {/* ─── Action + Progress Container ─── */}
            <Animated.View
              entering={FadeInDown.duration(400).delay(200)}
              className="bg-slate-50 dark:bg-slate-900 shadow-sm mt-8 p-6 border border-slate-100 dark:border-slate-800 rounded-[32px]"
            >
              <View className="flex-row mb-6">
                <Pressable
                  onPress={
                    book.status === "COMPLETED"
                      ? handleReadAgain
                      : handleContinueOrStartReading
                  }
                  disabled={book.status === "COMPLETED" && isResetting}
                  className="flex-row flex-1 justify-center items-center gap-3 bg-violet-600 dark:bg-violet-500 disabled:opacity-60 shadow-lg shadow-violet-600/30 rounded-2xl h-15 active:scale-95"
                  style={{ height: 60 }}
                >
                  {book.status === "COMPLETED" && isResetting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Feather
                      name={
                        book.status === "READING" ? "play-circle" : "book-open"
                      }
                      size={20}
                      color="#fff"
                    />
                  )}
                  <Text className="font-black text-white text-base uppercase tracking-wider">
                    {book.status === "READING"
                      ? "Continue"
                      : book.status === "COMPLETED"
                        ? "Read Again"
                        : "Start Reading"}
                  </Text>
                </Pressable>
              </View>

              <View className="flex-row justify-between mb-3 px-1">
                <Text className="font-black text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[1.5px]">
                  {book.pagesRead ?? 0} Pages Read
                </Text>
                <Text className="font-black text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[1.5px]">
                  {book.pages} Total
                </Text>
              </View>

              <View className="bg-slate-200 dark:bg-slate-800 shadow-inner rounded-full w-full h-2 overflow-hidden">
                <View
                  className="bg-violet-600 dark:bg-violet-500 rounded-full h-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </View>
              <Text className="mt-2.5 font-black text-[11px] text-slate-400 dark:text-slate-600 text-center uppercase tracking-widest">
                {progressPercentage}% Complete
              </Text>
            </Animated.View>

            {/* ─── Info Cards ─── */}
            <View className="mt-8">
              {book.isbn && (
                <InfoCard
                  label="ISBN-13"
                  value={book.isbn}
                  delay={250}
                  icon={<Feather name="hash" size={15} color="#94A3B8" />}
                />
              )}
              <InfoCard
                label="Started"
                value={formatDate(book.startDate)}
                icon={<Feather name="calendar" size={15} color="#94A3B8" />}
                delay={300}
              />
              <InfoCard
                label={book.status === "COMPLETED" ? "Finished" : "Target Date"}
                value={formatDate(book.finishDate)}
                icon={<Feather name="check" size={15} color="#94A3B8" />}
                delay={350}
              />
            </View>

            {/* ─── Personal Notes ─── */}
            {book.notes && (
              <Animated.View
                entering={FadeInDown.duration(400).delay(400)}
                className="bg-white dark:bg-slate-900/50 shadow-sm mt-2 mb-4 p-6 border border-slate-200 dark:border-slate-800 rounded-[32px]"
              >
                <View className="flex-row items-center gap-2.5 mb-4">
                  <View className="bg-amber-100 dark:bg-amber-900/20 p-1.5 rounded-lg">
                    <Feather name="edit-2" size={14} color="#D97706" />
                  </View>
                  <Text className="font-black text-slate-900 dark:text-slate-100 text-sm">
                    Reader Reflections
                  </Text>
                </View>

                <Text className="font-medium text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {book.notes}
                </Text>
              </Animated.View>
            )}
          </View>

          {/* ─── Delete Button ─── */}
          <Animated.View
            entering={FadeInDown.duration(400).delay(450)}
            className="mt-6 px-6"
          >
            <Pressable
              onPress={handleDelete}
              disabled={isDeleting}
              className="flex-row justify-center items-center gap-3 bg-red-50 active:bg-red-100 dark:bg-red-950/10 disabled:opacity-60 border border-red-100 dark:border-red-900/20 rounded-3xl w-full h-15"
              style={{ height: 60 }}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <Feather name="trash-2" size={18} color="#ef4444" />
              )}
              <Text className="font-bold text-red-600 text-base">
                Remove from Library
              </Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </View>
    </>
  );
}
