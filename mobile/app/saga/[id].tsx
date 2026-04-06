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
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { getSagaById, getSagaBooks, deleteSaga } from "@/src/services/sagaService";
import { showApiError } from "@/src/services/apiError";
import type { BookDTO } from "@/src/types/book";
import { useAppTheme } from "@/src/hooks/useAppTheme";

/* ─── Sub-components ─── */

function LoadingState() {
  return (
    <View className="flex-1 bg-white dark:bg-slate-950 items-center justify-center">
      <ActivityIndicator size="large" color="#7c4dff" />
    </View>
  );
}

function ErrorState({ onBack }: { onBack: () => void }) {
  return (
    <View className="flex-1 bg-white dark:bg-slate-950 items-center justify-center px-8">
      <View className="bg-red-50 dark:bg-red-900/10 p-6 rounded-[32px] items-center border border-red-100 dark:border-red-900/20">
        <Feather name="alert-circle" size={48} color="#ef4444" />
        <Text className="text-slate-950 dark:text-slate-50 text-xl font-bold mt-4 text-center">
          Saga not found
        </Text>
        <Text className="text-slate-500 dark:text-slate-400 text-sm mt-2 text-center leading-5">
          We couldn&apos;t load the details for this saga. It might have been deleted.
        </Text>
        <Pressable
          onPress={onBack}
          className="mt-6 bg-slate-900 dark:bg-slate-50 rounded-2xl px-8 py-3.5 shadow-lg active:scale-95"
        >
          <Text className="text-white dark:text-slate-950 font-bold">Go Back</Text>
        </Pressable>
      </View>
    </View>
  );
}

function BookMiniCard({ book, delay }: { book: BookDTO; delay: number }) {
  const router = useRouter();
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(delay)}
      className="mr-5"
      style={{ width: 100 }}
    >
      <Pressable 
        onPress={() => router.push(`/book/${book.id}`)}
        className="active:opacity-80"
      >
        {/* Cover */}
        <View
          className="rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
          style={{ width: 100, height: 145 }}
        >
          {book.coverUrl ? (
            <Image
              source={{ uri: book.coverUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Feather name="book" size={24} color="#94A3B8" />
            </View>
          )}
        </View>

        {/* Title */}
        <Text
          className="text-slate-900 dark:text-slate-100 text-[11px] font-bold mt-2.5 text-center leading-[15px]"
          numberOfLines={2}
        >
          {book.title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

/* ─── Main Screen ─── */

export default function SagaDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { mode, colors } = useAppTheme();
  const queryClient = useQueryClient();

  const {
    data: saga,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["saga", id],
    queryFn: () => getSagaById(id),
    enabled: !!id,
  });

  const { data: books = [] } = useQuery({
    queryKey: ["saga-books", id],
    queryFn: () => getSagaBooks(id),
    enabled: !!id,
  });

  const { mutate: removeSaga, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteSaga(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sagas"] });
      router.back();
    },
    onError: (err: unknown) => showApiError("Failed to delete saga", err),
  });

  function handleDelete() {
    if (!saga) return;
    Alert.alert(
      "Delete Saga",
      `Are you sure you want to permanently delete "${saga.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => removeSaga() },
      ]
    );
  }

  if (isLoading) return <LoadingState />;
  if (isError || !saga) return <ErrorState onBack={() => router.back()} />;

  const coverWidth = width * 0.62;

  return (
    <>
      <StatusBar style={mode === 'dark' ? "light" : "dark"} />
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-white dark:bg-slate-950">
        {/* Background Accent Gradient overlay */}
        <View className="absolute top-0 left-0 right-0 h-64 bg-violet-600/5 dark:bg-violet-500/5" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        >
          {/* ─── Top App Bar ─── */}
          <View
            className="flex-row items-center justify-between px-6 pb-4"
            style={{ paddingTop: insets.top + 8 }}
          >
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm active:scale-90"
              hitSlop={8}
            >
              <Feather name="arrow-left" size={20} color={colors.text} />
            </Pressable>

            <View className="flex-1 mx-4">
              <Text
                className="text-slate-900 dark:text-slate-50 font-black text-center text-lg tracking-tight"
                numberOfLines={1}
              >
                Saga Details
              </Text>
            </View>

            <Pressable
              onPress={() => router.push(`/edit-saga/${id}`)}
              className="w-10 h-10 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm active:scale-90"
              hitSlop={8}
            >
              <Feather name="edit-3" size={18} color={colors.text} />
            </Pressable>
          </View>

          {/* ─── Cover Image ─── */}
          <Animated.View
            entering={FadeIn.duration(600)}
            className="self-center mt-6 rounded-[40px] overflow-hidden shadow-2xl"
            style={{
              width: coverWidth,
              aspectRatio: 2 / 3,
              shadowColor: mode === 'dark' ? "#000" : "#6b38d4",
              elevation: 25,
            }}
          >
            {saga.coverUrl ? (
              <Image
                source={{ uri: saga.coverUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-slate-200 dark:bg-slate-900 items-center justify-center">
                <Text className="text-5xl font-bold text-slate-400 dark:text-slate-700">
                  {saga.name.charAt(0).toUpperCase()}
                </Text>
                <Feather name="layers" size={40} color={mode === 'dark' ? "#334155" : "#CBD5E1"} style={{ marginTop: 10 }} />
              </View>
            )}
          </Animated.View>

          <View className="px-6">
            {/* ─── Title + Meta ─── */}
            <Animated.View
              entering={FadeInDown.duration(400).delay(100)}
              className="mt-10 items-center"
            >
              <Text className="text-4xl font-black text-slate-950 dark:text-slate-50 text-center tracking-tight leading-tight">
                {saga.name}
              </Text>

              <View className="flex-row items-center gap-2 mt-4">
                <View className="bg-violet-100 dark:bg-violet-950/40 rounded-full px-4 py-1.5 border border-violet-200 dark:border-violet-900/30">
                  <Text className="text-violet-600 dark:text-violet-400 text-[10px] font-black uppercase tracking-[2px]">
                    {saga.bookCount ?? 0} {saga.bookCount === 1 ? "Volume" : "Volumes"}
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* ─── Description ─── */}
            {saga.description && (
              <Animated.View
                entering={FadeInDown.duration(400).delay(200)}
                className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60 rounded-[32px] p-6 mt-8 shadow-sm"
              >
                <View className="flex-row items-center gap-2.5 mb-4">
                  <View className="bg-violet-100 dark:bg-violet-500/20 w-8 h-8 rounded-xl items-center justify-center">
                    <Feather name="file-text" size={16} color={mode === 'dark' ? "#A78BFA" : "#6d28d9"} />
                  </View>
                  <Text className="text-sm font-black text-slate-800 dark:text-slate-100">About this Saga</Text>
                </View>
                <Text className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {saga.description}
                </Text>
              </Animated.View>
            )}

            {/* ─── Books Section ─── */}
            {books.length > 0 && (
              <Animated.View
                entering={FadeInDown.duration(400).delay(300)}
                className="mt-10"
              >
                <View className="flex-row items-center justify-between mb-5 px-1">
                  <View className="flex-row items-center gap-2.5">
                    <Text className="text-xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-[3px]">
                      Collection
                    </Text>
                  </View>
                  <Text className="text-xs font-bold text-slate-400 dark:text-slate-600">
                    {books.length} Books
                  </Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 4, paddingBottom: 10 }}
                >
                  {books.map((book, i) => (
                    <BookMiniCard key={book.id} book={book} delay={i * 50} />
                  ))}
                </ScrollView>
              </Animated.View>
            )}
          </View>

          {/* ─── Delete Button ─── */}
          <Animated.View
            entering={FadeInDown.duration(400).delay(400)}
            className="px-6 mt-10"
          >
            <Pressable
              onPress={handleDelete}
              disabled={isDeleting}
              className="w-full h-15 rounded-3xl bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 flex-row items-center justify-center gap-3 active:bg-red-100 disabled:opacity-60"
              style={{ height: 60 }}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <Feather name="trash-2" size={18} color="#ef4444" />
              )}
              <Text className="text-red-600 font-bold text-base">Remove from Library</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </View>
    </>
  );
}
