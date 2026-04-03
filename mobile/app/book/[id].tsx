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

import { getBookById, resetBookForReread, deleteBook } from "@/src/services/bookService";
import { showApiError } from "@/src/services/apiError";
import { pendingSessionBookAtom } from "@/src/store/session";
import type { BookStatus } from "@/src/types/book";

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
      return "READING NOW";
    case "COMPLETED":
      return "COMPLETED";
    case "DROPPED":
      return "DROPPED";
    default:
      return "TO READ";
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
          size={15}
          color={i <= filled ? "#F59E0B" : "#475569"}
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
      entering={FadeInDown.duration(350).delay(delay)}
      className="bg-[#1E293B] border border-white/[0.08] rounded-2xl p-4 mb-3"
    >
      <Text className="text-[10px] uppercase text-slate-500 mb-1 tracking-widest">
        {label}
      </Text>
      <View className="flex-row items-center gap-2">
        {icon}
        <Text className="text-base text-white font-medium">{value}</Text>
      </View>
    </Animated.View>
  );
}

/* ─── Loading / Error States ─── */

function LoadingState() {
  return (
    <View className="flex-1 bg-[#0F172A] items-center justify-center">
      <ActivityIndicator size="large" color="#A78BFA" />
    </View>
  );
}

function ErrorState({ onBack }: { onBack: () => void }) {
  return (
    <View className="flex-1 bg-[#0F172A] items-center justify-center px-8">
      <Feather name="alert-circle" size={48} color="#ef4444" />
      <Text className="text-white text-lg font-bold mt-4 text-center">
        {"Couldn't load book"}
      </Text>
      <Text className="text-slate-400 text-sm mt-2 text-center">
        Something went wrong. Please try again.
      </Text>
      <Pressable
        onPress={onBack}
        className="mt-6 bg-purple-600 rounded-full px-6 py-3"
      >
        <Text className="text-white font-bold">Go Back</Text>
      </Pressable>
    </View>
  );
}

/* ─── Main Screen ─── */

export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

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
      queryClient.invalidateQueries({ queryKey: ["currentlyReadingSelection"] });
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
      ]
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
        { text: "Reset & Read", style: "destructive", onPress: () => readAgain() },
      ]
    );
  }

  if (isLoading) return <LoadingState />;
  if (isError || !book) return <ErrorState onBack={() => router.back()} />;

  const progressPercentage =
    book.pages > 0
      ? Math.min(100, Math.floor(((book.pagesRead ?? 0) / book.pages) * 100))
      : 0;

  const coverWidth = width * 0.65;

  return (
    <>
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          title: book?.title ?? "Book Details",
          headerShown: false,
        }}
      />

      <View className="flex-1 bg-[#0F172A]">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        >
          {/* ─── Top App Bar ─── */}
          <View
            className="flex-row items-center justify-between px-6 pb-4"
            style={{ paddingTop: insets.top + 8 }}
          >
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
              hitSlop={8}
            >
              <Feather name="arrow-left" size={20} color="#F8FAFC" />
            </Pressable>

            <Text
              className="text-white font-bold text-base flex-1 text-center mx-3"
              numberOfLines={1}
            >
              {book?.title}
            </Text>

            <Pressable
              onPress={() => router.push(`/edit-book/${id}`)}
              className="w-10 h-10 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
              hitSlop={8}
            >
              <Feather name="edit-2" size={18} color="#F8FAFC" />
            </Pressable>
          </View>

          {/* ─── Cover Image ─── */}
          <Animated.View
            entering={FadeIn.duration(400)}
            className="self-center rounded-3xl overflow-hidden"
            style={{
              width: coverWidth,
              aspectRatio: 2 / 3,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 16 },
              shadowOpacity: 0.6,
              shadowRadius: 24,
              elevation: 20,
            }}
          >
            {book.coverUrl ? (
              <Image
                source={{ uri: book.coverUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-[#1E293B] items-center justify-center">
                <Text className="text-8xl">📖</Text>
              </View>
            )}
          </Animated.View>

          <View className="px-6">
            {/* ─── Metadata Header ─── */}
            <Animated.View
              entering={FadeInDown.duration(350).delay(80)}
              className="mt-8"
            >
              {/* Status badge + rating row */}
              <View className="flex-row items-center gap-3 mb-2">
                <View className="bg-purple-500/20 rounded px-2 py-0.5">
                  <Text className="text-purple-200 text-[10px] font-bold uppercase tracking-wide">
                    {getStatusLabel(book.status)}
                  </Text>
                </View>
                <StarRating rating={book.rating} />
              </View>

              <Text className="text-4xl font-bold text-white mt-1 leading-tight">
                {book.title}
              </Text>
              <Text className="text-lg italic text-slate-300 mt-2">
                {book.author}
              </Text>
            </Animated.View>

            {/* Category Tags */}
            {book.categories && book.categories.length > 0 && (
              <Animated.View
                entering={FadeInDown.duration(350).delay(130)}
                className="flex-row flex-wrap gap-2 mt-4"
              >
                {book.categories.map((cat, i) => (
                  <View
                    key={`${cat.name}-${i}`}
                    className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
                    style={{
                      backgroundColor: cat.color ? `${cat.color}28` : "rgba(167, 139, 250, 0.1)",
                      borderWidth: 1,
                      borderColor: cat.color ? cat.color : "rgba(167, 139, 250, 0.3)",
                    }}
                  >
                    <Text className="text-xs font-medium" style={{ color: cat.color ? cat.color : "#c084fc" }}>
                      {cat.name}
                    </Text>
                  </View>
                ))}
              </Animated.View>
            )}

            {/* ─── Action + Progress Container ─── */}
            <Animated.View
              entering={FadeInDown.duration(350).delay(180)}
              className="bg-white/5 border border-white/10 rounded-3xl p-4 mt-6"
            >
              {/* Buttons row */}
              <View className="flex-row mb-4">
                <Pressable
                  onPress={
                    book.status === "COMPLETED"
                      ? handleReadAgain
                      : handleContinueOrStartReading
                  }
                  disabled={book.status === "COMPLETED" && isResetting}
                  className="flex-1 bg-purple-600 rounded-full h-14 flex-row items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
                >
                  {book.status === "COMPLETED" && isResetting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <MaterialIcons name="play-arrow" size={22} color="#fff" />
                  )}
                  <Text className="text-white font-bold text-base">
                    {book.status === "READING"
                      ? "Continue Reading"
                      : book.status === "COMPLETED"
                      ? "Read Again"
                      : "Start Reading"}
                  </Text>
                </Pressable>
              </View>

              {/* Progress text row */}
              <View className="flex-row justify-between px-2">
                <Text className="text-[10px] uppercase font-semibold text-slate-500 tracking-widest">
                  {book.pagesRead ?? 0} pages read
                </Text>
                <Text className="text-[10px] uppercase font-semibold text-slate-500 tracking-widest">
                  {book.pages} pages total
                </Text>
              </View>

              {/* Progress bar */}
              <View className="mt-3 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <View
                  className="h-full rounded-full bg-purple-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </View>
              <Text className="text-center text-[10px] text-slate-500 mt-1.5 tracking-wide">
                {progressPercentage}%
              </Text>
            </Animated.View>

            {/* ─── Info Cards ─── */}
            <View className="mt-4">
              {book.isbn && (
                <InfoCard
                  label="ISBN-13"
                  value={book.isbn}
                  delay={230}
                />
              )}
              <InfoCard
                label="Started Reading"
                value={formatDate(book.startDate)}
                icon={
                  <Feather name="calendar" size={15} color="#64748B" />
                }
                delay={270}
              />
              <InfoCard
                label={book.status === "COMPLETED" ? "Finished Reading" : "Target / Finish Date"}
                value={formatDate(book.finishDate)}
                icon={
                  <Feather name="calendar" size={15} color="#64748B" />
                }
                delay={310}
              />
            </View>

            {/* ─── Personal Notes ─── */}
            {book.notes && (
              <Animated.View
                entering={FadeInDown.duration(350).delay(360)}
                className="bg-white/5 border border-white/10 rounded-3xl p-5 relative overflow-hidden mb-2 mt-1"
              >
                {/* Watermark quote icon */}
                <Text className="absolute top-3 right-4 text-white/5 text-8xl font-black leading-none select-none">
                  {"\""}
                </Text>

                {/* Header */}
                <View className="flex-row items-center gap-2 mb-4">
                  <Feather name="menu" size={16} color="#A78BFA" />
                  <Text className="text-sm font-bold text-white">
                    Personal Notes
                  </Text>
                </View>

                {/* Notes text */}
                <Text className="text-sm text-slate-400 leading-relaxed">
                  {book.notes}
                </Text>
              </Animated.View>
            )}
          </View>

          {/* ─── Delete Button ─── */}
          <Animated.View
            entering={FadeInDown.duration(350).delay(400)}
            className="px-6 mt-2"
          >
            <Pressable
              onPress={handleDelete}
              disabled={isDeleting}
              className="w-full h-14 rounded-2xl bg-red-600/90 flex-row items-center justify-center gap-2 active:bg-red-700 disabled:opacity-60"
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Feather name="trash-2" size={18} color="#fff" />
              )}
              <Text className="text-white font-bold text-base">
                Delete Book
              </Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </View>
    </>
  );
}
