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

/* ─── Sub-components ─── */

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
        {"Couldn't load saga"}
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

function BookMiniCard({ book, delay }: { book: BookDTO; delay: number }) {
  return (
    <Animated.View
      entering={FadeInDown.duration(300).delay(delay)}
      className="items-center mr-4"
      style={{ width: 96 }}
    >
      {/* Cover */}
      <View
        className="rounded-xl overflow-hidden bg-[#1E293B]"
        style={{ width: 96, height: 136 }}
      >
        {book.coverUrl ? (
          <Image
            source={{ uri: book.coverUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Feather name="book" size={28} color="#475569" />
          </View>
        )}
      </View>

      {/* Name */}
      <Text
        className="text-white text-xs font-semibold mt-2 text-center leading-tight"
        numberOfLines={2}
      >
        {book.title}
      </Text>

      {/* Author */}
      <Text
        className="text-slate-500 text-[10px] mt-0.5 text-center"
        numberOfLines={1}
      >
        {book.author}
      </Text>
    </Animated.View>
  );
}

/* ─── Main Screen ─── */

export default function SagaDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
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

  const coverWidth = width * 0.65;

  return (
    <>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />

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
              {saga.name}
            </Text>

            <Pressable
              onPress={() => router.push(`/edit-saga/${id}`)}
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
            {saga.coverUrl ? (
              <Image
                source={{ uri: saga.coverUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-[#1E293B] items-center justify-center">
                <Text className="text-8xl">📚</Text>
              </View>
            )}
          </Animated.View>

          <View className="px-6">
            {/* ─── Title + Meta ─── */}
            <Animated.View
              entering={FadeInDown.duration(350).delay(80)}
              className="mt-8"
            >
              <Text className="text-4xl font-bold text-white leading-tight">
                {saga.name}
              </Text>

              {saga.bookCount != null && (
                <View className="flex-row items-center gap-2 mt-3">
                  <View className="bg-purple-500/20 rounded px-2 py-0.5">
                    <Text className="text-purple-200 text-[10px] font-bold uppercase tracking-wide">
                      {saga.bookCount} {saga.bookCount === 1 ? "volume" : "volumes"}
                    </Text>
                  </View>
                </View>
              )}
            </Animated.View>

            {/* ─── Description ─── */}
            {saga.description && (
              <Animated.View
                entering={FadeInDown.duration(350).delay(130)}
                className="bg-white/5 border border-white/10 rounded-3xl p-5 relative overflow-hidden mt-6"
              >
                <Text className="absolute top-3 right-4 text-white/5 text-8xl font-black leading-none select-none">
                  {'"'}
                </Text>
                <View className="flex-row items-center gap-2 mb-4">
                  <Feather name="align-left" size={16} color="#A78BFA" />
                  <Text className="text-sm font-bold text-white">Description</Text>
                </View>
                <Text className="text-sm text-slate-400 leading-relaxed">
                  {saga.description}
                </Text>
              </Animated.View>
            )}

            {/* ─── Books Section ─── */}
            {books.length > 0 && (
              <Animated.View
                entering={FadeInDown.duration(350).delay(180)}
                className="mt-6"
              >
                <View className="flex-row items-center gap-2 mb-4">
                  <Feather name="book-open" size={15} color="#A78BFA" />
                  <Text className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                    Books
                  </Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 8 }}
                >
                  {books.map((book, i) => (
                    <BookMiniCard key={book.id} book={book} delay={i * 40} />
                  ))}
                </ScrollView>
              </Animated.View>
            )}
          </View>

          {/* ─── Delete Button ─── */}
          <Animated.View
            entering={FadeInDown.duration(350).delay(260)}
            className="px-6 mt-8"
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
              <Text className="text-white font-bold text-base">Delete Saga</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </View>
    </>
  );
}
