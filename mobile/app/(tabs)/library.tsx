import { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Image,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

import { useAppTheme } from "@/src/hooks/useAppTheme";
import { getAllBooks, searchBooks } from "@/src/services/bookService";
import { getSagas } from "@/src/services/sagaService";
import { getCategories } from "@/src/services/categoryService";
import type { BookDTO, BookStatus, SagaDTO, CategoryDTO } from "@/src/types/book";

/* ─── Status / progress helpers ─── */

type StatusConfig = { bgClass: string; label: string };

function getStatusConfig(status: BookStatus): StatusConfig {
  switch (status) {
    case "READING":
      return { bgClass: "bg-[#f59e0b]", label: "Reading" };
    case "COMPLETED":
      return { bgClass: "bg-[#10b981]", label: "Done" };
    case "DROPPED":
      return { bgClass: "bg-[#ef4444]", label: "Dropped" };
    default:
      return { bgClass: "bg-[#94A3B8]", label: "To Read" };
  }
}

/* ─── BookCard ─── */

const PROGRESS_COLOR: Record<BookStatus, string> = {
  COMPLETED: "#10b981",
  READING:   "#A78BFA",
  DROPPED:   "#ef4444",
  TO_READ:   "#94A3B8",
};

function BookCard({ book, index }: { book: BookDTO; index: number }) {
  const router = useRouter();
  const { bgClass, label } = getStatusConfig(book.status);
  const progressColor = PROGRESS_COLOR[book.status];
  const progressPercentage = book.pages && book.pages > 0
    ? Math.floor(((book.pagesRead ?? 0) / book.pages) * 100)
    : 0;

  return (
    <Animated.View
      entering={FadeInDown.duration(300).delay(index * 30)}
      className="w-[48%]"
    >
      <Pressable 
        onPress={() => router.push(`/book/${book.id}`)} 
        className="w-full active:opacity-90"
      >
        {({ pressed }) => (
          <>
            {/* ── Cover (image-only container with rounded corners) ── */}
            <View 
              className="w-full aspect-[2/3] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
              style={{
                transform: [{ scale: pressed ? 0.96 : 1 }],
              }}
            >
              <View className="w-full h-full">
                {book.coverUrl ? (
                  <Image
                    source={{ uri: book.coverUrl }}
                    className="w-full h-full"
                    style={{ opacity: pressed ? 0.7 : 1 }}
                    resizeMode="cover"
                  />
                ) : (
                  <View 
                    className="w-full h-full bg-slate-100 dark:bg-slate-900 items-center justify-center"
                    style={{ opacity: pressed ? 0.7 : 1 }}
                  >
                    <Text className="text-5xl">📖</Text>
                  </View>
                )}
              </View>

              {/* Status badge — top-left, over the image */}
              <View 
                className={`absolute top-2 left-2 rounded-full px-2 py-0.5 ${bgClass}`}
                style={{ opacity: pressed ? 0.8 : 1 }}
              >
                <Text className="text-[10px] font-bold text-white uppercase tracking-tighter">{label}</Text>
              </View>

              {/* Category tag — top-right, over the image */}
              {book.categories && book.categories.length > 0 && (
                <View 
                  className="absolute top-2 right-2 bg-slate-950/40 dark:bg-slate-950/60 rounded-full px-2 py-0.5 max-w-[80px]"
                  style={{ opacity: pressed ? 0.8 : 1 }}
                >
                  <Text
                    className="text-[10px] font-bold text-white dark:text-slate-200"
                    numberOfLines={1}
                  >
                    {book.categories[0].name}
                  </Text>
                </View>
              )}
            </View>

            {/* ── Text + progress bar below the cover ── */}
            <View 
              className="mt-2.5 px-0.5"
              style={{
                transform: [{ scale: pressed ? 0.98 : 1 }],
                opacity: pressed ? 0.8 : 1
              }}
            >
              <Text
                className="text-[14px] font-bold text-slate-900 dark:text-slate-50 leading-[18px]"
                numberOfLines={1}
              >
                {book.title}
              </Text>
              <Text
                className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5"
                numberOfLines={1}
              >
                {book.author}
              </Text>

              <Text
                className={`text-[10px] font-bold uppercase mt-1.5`}
                style={{ color: progressColor }}
              >
                {progressPercentage}% read
              </Text>

              {/* Reading progress bar */}
              <View className="mt-1 h-1 w-full rounded-full bg-slate-200 dark:bg-slate-900 overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{ width: `${progressPercentage}%`, backgroundColor: progressColor }}
                />
              </View>
            </View>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

/* ─── SagaCard ─── */

function SagaCard({ saga, index }: { saga: SagaDTO; index: number }) {
  const initial = saga.name.charAt(0).toUpperCase();
  const volumeCount = saga.bookCount ?? 0;

  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(index * 50)}
      className="w-[280px] rounded-3xl overflow-hidden mr-4 shadow-xl shadow-black/10"
      style={{ aspectRatio: 16 / 9 }}
    >
      {/* Background: cover image or placeholder */}
      {saga.coverUrl ? (
        <Image
          source={{ uri: saga.coverUrl }}
          className="absolute inset-0 w-full h-full"
          resizeMode="cover"
        />
      ) : (
        <View className="absolute inset-0 bg-slate-950 items-center justify-center">
          <Text className="text-7xl font-bold text-slate-800">{initial}</Text>
        </View>
      )}

      {/* Modern Gradient-like Overlay */}
      <View className="absolute inset-0 bg-slate-950/20" />
      <View className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

      {/* Info Content */}
      <View className="absolute bottom-0 left-0 right-0 p-5">
        {/* Volume badge */}
        {volumeCount > 0 && (
          <View className="self-start bg-violet-600 dark:bg-violet-500 rounded-full px-2.5 py-1 mb-2 shadow-lg shadow-violet-900/40">
            <Text className="text-[10px] font-black text-white uppercase tracking-widest">
              {volumeCount} {volumeCount === 1 ? "Volume" : "Volumes"}
            </Text>
          </View>
        )}
        <Text className="font-black text-xl text-white tracking-tight" numberOfLines={1}>
          {saga.name}
        </Text>
      </View>
    </Animated.View>
  );
}

/* ─── FAB Menu ─── */

type FABAction = "book" | "saga" | "category";

const FAB_ITEMS: { icon: React.ComponentProps<typeof Feather>["name"]; label: string; action: FABAction }[] = [
  { icon: "book", label: "Add Book", action: "book" },
  { icon: "layers", label: "Add Saga", action: "saga" },
  { icon: "tag", label: "Add Category", action: "category" },
];

function FABMenu({
  open,
  onClose,
  onAction,
  fabTop,
  iconColor,
}: {
  open: boolean;
  onClose: () => void;
  onAction: (action: FABAction) => void;
  fabTop: number;
  iconColor: string;
}) {
  return (
    <>
      {open && (
        <Pressable className="absolute inset-0 z-10" onPress={onClose} />
      )}

      {open && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          className="absolute right-5 z-20 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden dark:border dark:border-slate-800 shadow-2xl"
          style={{ top: fabTop, minWidth: 180 }}
        >
          {FAB_ITEMS.map((item, i) => (
            <Pressable
              key={item.label}
              onPress={() => { onClose(); onAction(item.action); }}
              className={`flex-row items-center gap-3 px-4 py-3.5 ${
                i < FAB_ITEMS.length - 1
                  ? "border-b border-[#E2E8F0] dark:border-[#334155]"
                  : ""
              }`}
            >
              <Feather name={item.icon} size={18} color={iconColor} />
              <Text className="text-sm font-medium text-[#111c2d] dark:text-[#F8FAFC]">
                {item.label}
              </Text>
            </Pressable>
          ))}
        </Animated.View>
      )}
    </>
  );
}

/* ─── Empty state ─── */

function EmptyBooks({ hasSearch }: { hasSearch: boolean }) {
  return (
    <View className="py-16 items-center">
      <Text className="text-[40px] mb-4">📚</Text>
      <Text className="text-[17px] font-semibold text-[#111c2d] dark:text-[#F8FAFC] mb-1.5">
        {hasSearch ? "No results" : "No books yet"}
      </Text>
      <Text className="text-sm text-[#494454] dark:text-[#94A3B8] text-center leading-5 max-w-[260px]">
        {hasSearch
          ? "Try a different search term."
          : "Add your first book using the + button above."}
      </Text>
    </View>
  );
}

/* ─── Screen ─── */

export default function LibraryScreen() {
  const { mode } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const router = useRouter();

  const iconColor = mode === "dark" ? "#A78BFA" : "#6b38d4";
  const searchIconColor = mode === "dark" ? "#94A3B8" : "#494454";
  const purple = mode === "dark" ? "#A78BFA" : "#6b38d4";
  const inactiveBorder = mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(107, 56, 212, 0.08)";

  const searchAnimatedBorder = useAnimatedStyle(() => ({
    borderColor: withTiming(searchFocused ? purple : inactiveBorder, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    }),
  }), [searchFocused, purple, inactiveBorder]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data: searchResults } = useQuery({
    queryKey: ["books", "search", debouncedQuery],
    queryFn: () => searchBooks(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  const { data: allBooks } = useQuery({
    queryKey: ["books", "all"],
    queryFn: () => getAllBooks(),
    enabled: debouncedQuery.length === 0,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const { data: sagas } = useQuery({
    queryKey: ["sagas"],
    queryFn: () => getSagas(),
  });

  const rawBooks: BookDTO[] =
    debouncedQuery.length > 0 ? (searchResults ?? []) : (allBooks ?? []);

  const filteredBooks = selectedCategory
    ? rawBooks.filter((b) => b.categories?.some(c => c.id === selectedCategory))
    : rawBooks;

  const safeCategories: CategoryDTO[] = Array.isArray(categories) ? categories : [];
  const safeSagas: SagaDTO[] = Array.isArray(sagas) ? sagas : [];

  return (
    <View className="flex-1 bg-white dark:bg-slate-950">
      <StatusBar style={mode === "dark" ? "light" : "dark"} />

      <FABMenu
        open={fabOpen}
        onClose={() => setFabOpen(false)}
        onAction={(action) => {
          if (action === "book") router.push("/add-book");
          else if (action === "saga") router.push("/add-saga");
          else if (action === "category") router.push("/add-category");
        }}
        fabTop={insets.top + 68}
        iconColor={iconColor}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 48,
        }}
      >
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(400)}
          className="pt-3.5 pb-6 flex-row justify-between items-center"
        >
          <Text className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            Library
          </Text>

          <Pressable
            onPress={() => setFabOpen((p) => !p)}
            className="w-11 h-11 rounded-full bg-violet-600 dark:bg-violet-500 items-center justify-center shadow-xl shadow-violet-600/30 dark:shadow-violet-900/40 active:scale-95"
          >
            <Feather name="plus" size={24} color="#fff" />
          </Pressable>
        </Animated.View>

        {/* Search input */}
        <Animated.View
          entering={FadeIn.duration(400).delay(60)}
          className="flex-row items-center gap-3 bg-slate-100 dark:bg-slate-900 rounded-2xl px-5 py-4 mb-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50"
          style={[searchAnimatedBorder]}
        >
          <Feather name="search" size={18} color={searchIconColor} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search titles or authors…"
            placeholderTextColor="#94A3B8"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="flex-1 text-[15px] font-medium text-slate-900 dark:text-slate-50"
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={12}>
              <View className="bg-slate-200 dark:bg-slate-900 rounded-full p-1">
                <Feather name="x" size={12} color="#94A3B8" />
              </View>
            </Pressable>
          )}
        </Animated.View>

        {/* Category chips */}
        {safeCategories.length > 0 && (
          <Animated.View
            entering={FadeIn.duration(400).delay(100)}
            className="mb-8"
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingVertical: 2 }}
            >
              <Pressable
                onPress={() => setSelectedCategory(null)}
                className={`rounded-full px-5 py-2.5 ${
                  selectedCategory === null
                    ? "bg-violet-600 dark:bg-violet-500 shadow-md shadow-violet-600/20"
                    : "bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50"
                }`}
              >
                <Text
                  className={`text-xs font-black uppercase tracking-wider ${
                    selectedCategory === null
                      ? "text-white"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  All
                </Text>
              </Pressable>

              {safeCategories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() =>
                    setSelectedCategory(
                      selectedCategory === cat.id ? null : cat.id
                    )
                  }
                  className={`rounded-full px-5 py-2.5 ${
                    selectedCategory === cat.id
                      ? "bg-violet-600 dark:bg-violet-500 shadow-md shadow-violet-600/20"
                      : "bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50"
                  }`}
                >
                  <Text
                    className={`text-xs font-black uppercase tracking-wider ${
                      selectedCategory === cat.id
                        ? "text-white"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Sagas section */}
        {safeSagas.length > 0 && (
          <Animated.View
            entering={FadeIn.duration(400).delay(140)}
            className="mb-10"
          >
            <View className="flex-row items-center justify-between mb-5 px-1">
              <Text className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[3px]">
                Sagas
              </Text>
              <Text className="text-xs font-bold text-slate-400 dark:text-slate-700">
                {safeSagas.length} Collections
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 4, paddingBottom: 10 }}
            >
              {safeSagas.map((saga, i) => (
                <Pressable
                  key={saga.id}
                  onPress={() => router.push(`/saga/${saga.id}`)}
                  className="active:opacity-80"
                >
                  <SagaCard saga={saga} index={i} />
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Books section */}
        <Animated.View entering={FadeIn.duration(400).delay(180)}>
          <View className="flex-row items-center justify-between mb-5 px-1">
            <Text className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[3px]">
              Books
            </Text>
            <Text className="text-xs font-bold text-slate-400 dark:text-slate-700">
              {filteredBooks.length} Items
            </Text>
          </View>

          {filteredBooks.length === 0 ? (
            <EmptyBooks hasSearch={searchQuery.length > 0} />
          ) : (
            <View className="flex-row flex-wrap gap-4">
              {filteredBooks.map((book, i) => (
                <BookCard key={book.id} book={book} index={i} />
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
