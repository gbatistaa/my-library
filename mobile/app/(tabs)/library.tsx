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
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

import { useAppTheme } from "@/src/hooks/useAppTheme";
import { getAllBooks, searchBooks } from "@/src/services/bookService";
import { getSagas } from "@/src/services/sagaService";
import { getCategories } from "@/src/services/categoryService";
import type {
  BookDTO,
  BookStatus,
  SagaDTO,
  CategoryDTO,
} from "@/src/types/book";

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
  READING: "#A78BFA",
  DROPPED: "#ef4444",
  TO_READ: "#94A3B8",
};

function BookCard({ book, index, router }: { book: BookDTO; index: number; router: any }) {
  const { bgClass, label } = getStatusConfig(book.status);
  const progressColor = PROGRESS_COLOR[book.status];
  const progressPercentage =
    book.pages && book.pages > 0
      ? Math.floor(((book.pagesRead ?? 0) / book.pages) * 100)
      : 0;

  return (
    <Animated.View
      entering={FadeInDown.duration(300).delay(index * 30)}
      className="w-[48%]"
    >
      <Pressable
        onPress={() => router.push(`/book/${book.id}`)}
        className="active:opacity-90 w-full"
      >
        {({ pressed }) => (
          <>
            {/* ── Cover (image-only container with rounded corners) ── */}
            <View
              className="border border-slate-200 dark:border-slate-800 rounded-2xl w-full aspect-[2/3] overflow-hidden"
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
                    className="justify-center items-center bg-slate-100 dark:bg-slate-900 w-full h-full"
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
                <Text className="font-bold text-[10px] text-white uppercase tracking-tighter">
                  {label}
                </Text>
              </View>

              {/* Category tag — top-right, over the image */}
              {book.categories && book.categories.length > 0 && (
                <View
                  className="top-2 right-2 absolute bg-slate-950/40 dark:bg-slate-950/60 px-2 py-0.5 rounded-full max-w-[80px]"
                  style={{ opacity: pressed ? 0.8 : 1 }}
                >
                  <Text
                    className="font-bold text-[10px] text-white dark:text-slate-200"
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
                opacity: pressed ? 0.8 : 1,
              }}
            >
              <Text
                className="font-bold text-[14px] text-slate-900 dark:text-slate-50 leading-[18px]"
                numberOfLines={1}
              >
                {book.title}
              </Text>
              <Text
                className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400"
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
              <View className="bg-slate-200 dark:bg-slate-900 mt-1 rounded-full w-full h-1 overflow-hidden">
                <View
                  className="rounded-full h-full"
                  style={{
                    width: `${progressPercentage}%`,
                    backgroundColor: progressColor,
                  }}
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

function SagaCard({ saga, index, router }: { saga: SagaDTO; index: number; router: any }) {
  const initial = saga.name.charAt(0).toUpperCase();
  const volumeCount = saga.bookCount ?? 0;

  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(index * 50)}
      className="shadow-black/10 shadow-xl mr-4 rounded-3xl w-[280px] overflow-hidden"
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
        <View className="absolute inset-0 justify-center items-center bg-slate-950">
          <Text className="font-bold text-slate-800 text-7xl">{initial}</Text>
        </View>
      )}

      {/* Modern Gradient-like Overlay */}
      <View className="absolute inset-0 bg-slate-950/20" />
      <View className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

      {/* Info Content */}
      <View className="right-0 bottom-0 left-0 absolute bg-black/40 p-4">
        {/* Volume badge */}
        {volumeCount > 0 && (
          <View className="self-start bg-violet-600 dark:bg-violet-500/20 shadow-lg shadow-violet-900/40 mb-2 px-2.5 py-1 border border-violet-500 rounded-full text-violet-500 solid">
            <Text className="font-bold text-white text-xs tracking-widest">
              {volumeCount} {volumeCount === 1 ? "Volume" : "Volumes"}
            </Text>
          </View>
        )}
        <Text
          className="font-black text-white text-xl tracking-tight"
          numberOfLines={1}
        >
          {saga.name}
        </Text>
      </View>
    </Animated.View>
  );
}

/* ─── FAB Menu ─── */

type FABAction = "book" | "saga" | "category";

const FAB_ITEMS: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  action: FABAction;
}[] = [
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
        <Pressable className="z-10 absolute inset-0" onPress={onClose} />
      )}

      {open && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          className="right-5 z-20 absolute bg-white dark:bg-slate-900 shadow-2xl dark:border dark:border-slate-800 rounded-2xl overflow-hidden"
          style={{ top: fabTop, minWidth: 180 }}
        >
          {FAB_ITEMS.map((item, i) => (
            <Pressable
              key={item.label}
              onPress={() => {
                onClose();
                onAction(item.action);
              }}
              className={`flex-row items-center gap-3 px-4 py-3.5 ${
                i < FAB_ITEMS.length - 1
                  ? "border-b border-[#E2E8F0] dark:border-[#334155]"
                  : ""
              }`}
            >
              <Feather name={item.icon} size={18} color={iconColor} />
              <Text className="font-medium text-[#111c2d] dark:text-[#F8FAFC] text-sm">
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
    <View className="items-center py-16">
      <Text className="mb-4 text-[40px]">📚</Text>
      <Text className="mb-1.5 font-semibold text-[#111c2d] text-[17px] dark:text-[#F8FAFC]">
        {hasSearch ? "No results" : "No books yet"}
      </Text>
      <Text className="max-w-[260px] text-[#494454] dark:text-[#94A3B8] text-sm text-center leading-5">
        {hasSearch
          ? "Try a different search term."
          : "Add your first book using the + button above."}
      </Text>
    </View>
  );
}

/* ─── Screen ─── */

export default function LibraryScreen() {
  const router = useRouter();
  const { mode } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [fabOpen, setFabOpen] = useState(false);
  const searchAnimatedValue = useSharedValue(0);

  const iconColor = mode === "dark" ? "#A78BFA" : "#6b38d4";
  const searchIconColor = mode === "dark" ? "#94A3B8" : "#494454";
  const purple = mode === "dark" ? "#A78BFA" : "#6b38d4";
  const inactiveBorder =
    mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(107, 56, 212, 0.08)";

  const searchAnimatedBorder = useAnimatedStyle(() => ({
    borderColor: withTiming(
      searchAnimatedValue.value === 1 ? purple : inactiveBorder,
      {
        duration: 200,
        easing: Easing.out(Easing.ease),
      },
    ),
  }), [purple, inactiveBorder]);

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
    ? rawBooks.filter((b) =>
        b.categories?.some((c) => c.id === selectedCategory),
      )
    : rawBooks;

  const safeCategories: CategoryDTO[] = Array.isArray(categories)
    ? categories
    : [];
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
          className="flex-row justify-between items-center pt-3.5 pb-6"
        >
          <Text className="font-black text-slate-900 dark:text-slate-50 text-3xl tracking-tight">
            Library
          </Text>

          <Pressable
            onPress={() => setFabOpen((p) => !p)}
            className="justify-center items-center bg-violet-600 dark:bg-violet-500 shadow-violet-600/30 shadow-xl dark:shadow-violet-900/40 rounded-full w-11 h-11 active:scale-95"
            hitSlop={8}
          >
            <Feather name="plus" size={24} color="#fff" />
          </Pressable>
        </Animated.View>

        {/* Search input */}
        <Animated.View
          entering={FadeIn.duration(400).delay(60)}
          className="flex-row items-center gap-3 bg-slate-100 dark:bg-slate-900 shadow-sm mb-6 px-5 py-4 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl"
          style={[searchAnimatedBorder]}
        >
          <Feather name="search" size={18} color={searchIconColor} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search titles or authors…"
            placeholderTextColor="#94A3B8"
            onFocus={() => {
              searchAnimatedValue.value = 1;
            }}
            onBlur={() => {
              searchAnimatedValue.value = 0;
            }}
            className="flex-1 font-medium text-[15px] text-slate-900 dark:text-slate-50"
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={12}>
              <View className="bg-slate-200 dark:bg-slate-900 p-1 rounded-full">
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
                      selectedCategory === cat.id ? null : cat.id,
                    )
                  }
                  className={`rounded-full px-5 py-2.5 ${
                    selectedCategory === cat.id
                      ? "bg-violet-600 dark:bg-violet-500"
                      : "bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50"
                  }`}
                  style={
                    selectedCategory === cat.id
                      ? {
                          shadowColor: mode === "dark" ? "#8B5CF6" : "#7C3AED",
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 10,
                          elevation: 8,
                        }
                      : {}
                  }
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
            <View className="flex-row justify-between items-center mb-5 px-1">
              <Text className="font-black text-slate-400 dark:text-slate-500 text-xs uppercase tracking-[3px]">
                Sagas
              </Text>
              <Text className="font-bold text-slate-400 dark:text-slate-700 text-xs">
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
                  <SagaCard saga={saga} index={i} router={router} />
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Books section */}
        <Animated.View entering={FadeIn.duration(400).delay(180)}>
          <View className="flex-row justify-between items-center mb-5 px-1">
            <Text className="font-black text-slate-400 dark:text-slate-500 text-xs uppercase tracking-[3px]">
              Books
            </Text>
            <Text className="font-bold text-slate-400 dark:text-slate-700 text-xs">
              {filteredBooks.length} Items
            </Text>
          </View>

          {filteredBooks.length === 0 ? (
            <EmptyBooks hasSearch={searchQuery.length > 0} />
          ) : (
            <View className="flex-row flex-wrap gap-4">
              {filteredBooks.map((book, i) => (
                <BookCard key={book.id} book={book} index={i} router={router} />
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
