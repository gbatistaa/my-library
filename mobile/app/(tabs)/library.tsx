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
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
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

const PROGRESS_PCT: Record<BookStatus, number> = {
  COMPLETED: 100,
  READING:   45,   // visual indicator — real % comes from reading sessions
  DROPPED:   20,
  TO_READ:   0,
};

function BookCard({ book, index }: { book: BookDTO; index: number }) {
  const { bgClass, label } = getStatusConfig(book.status);
  const progressColor = PROGRESS_COLOR[book.status];
  const progressPct   = PROGRESS_PCT[book.status];

  return (
    <Animated.View
      entering={FadeInDown.duration(300).delay(index * 30)}
      className="w-[48%]"
    >
      {/* ── Cover (image-only container with rounded corners) ── */}
      <View className="w-full aspect-[2/3] rounded-2xl overflow-hidden dark:border dark:border-[#334155]">
        {book.coverUrl ? (
          <Image
            source={{ uri: book.coverUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full bg-[#e9ddff] dark:bg-[#1E293B] items-center justify-center">
            <Text className="text-5xl">📖</Text>
          </View>
        )}

        {/* Status badge — top-left, over the image */}
        <View className={`absolute top-2 left-2 rounded-full px-2 py-0.5 ${bgClass}`}>
          <Text className="text-[10px] font-bold text-white">{label}</Text>
        </View>

        {/* Genre badge — top-right, over the image */}
        {book.genre && (
          <View className="absolute top-2 right-2 bg-[#e9ddff]/90 dark:bg-[#334155]/90 rounded-full px-2 py-0.5 max-w-[80px]">
            <Text
              className="text-[10px] font-bold text-[#5516be] dark:text-[#A78BFA]"
              numberOfLines={1}
            >
              {book.genre}
            </Text>
          </View>
        )}
      </View>

      {/* ── Text + progress bar below the cover ── */}
      <View className="mt-2.5 px-0.5">
        <Text
          className="text-[13px] font-bold text-[#111c2d] dark:text-[#F8FAFC] leading-[18px]"
          numberOfLines={1}
        >
          {book.title}
        </Text>
        <Text
          className="text-[11px] text-[#494454] dark:text-[#94A3B8] mt-0.5"
          numberOfLines={1}
        >
          {book.author}
        </Text>

        {/* Reading progress bar */}
        <View className="mt-2 h-1 w-full rounded-full bg-[#E2E8F0] dark:bg-[#334155] overflow-hidden">
          <View
            className="h-full rounded-full"
            style={{ width: `${progressPct}%`, backgroundColor: progressColor }}
          />
        </View>
      </View>
    </Animated.View>
  );
}

/* ─── SagaCard ─── */

function SagaCard({ saga, index }: { saga: SagaDTO; index: number }) {
  const initial = saga.name.charAt(0).toUpperCase();
  const volumeCount = saga.bookCount ?? 0;

  return (
    <Animated.View
      entering={FadeInDown.duration(300).delay(index * 40)}
      className="w-[280px] rounded-2xl overflow-hidden mr-4"
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
        <View className="absolute inset-0 bg-[#1E293B] items-center justify-center">
          <Text className="text-6xl font-bold text-[#A78BFA]/30">{initial}</Text>
        </View>
      )}

      {/* Dark overlay for contrast */}
      <View className="absolute inset-0 bg-black/30" />

      {/* Volume badge — above title strip */}
      {volumeCount > 0 && (
        <View className="absolute left-3 bg-[#334155]/80 rounded-full px-2.5 py-1" style={{ bottom: 52 }}>
          <Text className="text-[10px] font-bold text-[#A78BFA] uppercase tracking-wider">
            {volumeCount} {volumeCount === 1 ? "volume" : "volumes"}
          </Text>
        </View>
      )}

      {/* Title strip */}
      <View className="absolute bottom-0 left-0 right-0 bg-black/60 px-4 py-3">
        <Text className="font-bold text-base text-white" numberOfLines={1}>
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
          className="absolute right-5 z-20 bg-white dark:bg-[#1E293B] rounded-2xl overflow-hidden dark:border dark:border-[#334155] shadow-2xl"
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
  const router = useRouter();

  const iconColor = mode === "dark" ? "#A78BFA" : "#6b38d4";
  const searchIconColor = mode === "dark" ? "#94A3B8" : "#494454";

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
    ? rawBooks.filter((b) => b.genre === selectedCategory)
    : rawBooks;

  const safeCategories: CategoryDTO[] = Array.isArray(categories) ? categories : [];
  const safeSagas: SagaDTO[] = Array.isArray(sagas) ? sagas : [];

  return (
    <View className="flex-1 bg-[#f9f9ff] dark:bg-[#0F172A]">
      <StatusBar style={mode === "dark" ? "light" : "dark"} />

      <FABMenu
        open={fabOpen}
        onClose={() => setFabOpen(false)}
        onAction={(action) => {
          if (action === "book") router.push("/add-book");
          else if (action === "saga") router.push("/add-saga");
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
          <Text className="text-[28px] font-extrabold text-[#111c2d] dark:text-[#F8FAFC] tracking-[-0.5px]">
            Library
          </Text>

          <Pressable
            onPress={() => setFabOpen((p) => !p)}
            className="w-10 h-10 rounded-full bg-[#6b38d4] dark:bg-[#A78BFA] items-center justify-center shadow-lg shadow-[#6b38d4]/30 dark:shadow-[#A78BFA]/30 active:scale-95"
            style={{ elevation: 4 }}
          >
            <Text className="text-white text-[22px] leading-none font-bold">+</Text>
          </Pressable>
        </Animated.View>

        {/* Search input */}
        <Animated.View
          entering={FadeIn.duration(400).delay(60)}
          className="flex-row items-center gap-3 bg-[#f0f3ff] dark:bg-[#1E293B] rounded-full px-4 py-3 mb-4 dark:border dark:border-[#334155]"
        >
          <Feather name="search" size={16} color={searchIconColor} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search books…"
            placeholderTextColor="#94A3B8"
            className="flex-1 text-[15px] text-[#111c2d] dark:text-[#F8FAFC]"
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
              <Feather name="x" size={16} color="#94A3B8" />
            </Pressable>
          )}
        </Animated.View>

        {/* Category chips */}
        {safeCategories.length > 0 && (
          <Animated.View
            entering={FadeIn.duration(400).delay(100)}
            className="mb-6"
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
            >
              <Pressable
                onPress={() => setSelectedCategory(null)}
                className={`rounded-full px-4 py-2 ${
                  selectedCategory === null
                    ? "bg-[#6b38d4] dark:bg-[#A78BFA]"
                    : "bg-[#f0f3ff] dark:bg-[#1E293B]"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    selectedCategory === null
                      ? "text-white"
                      : "text-[#494454] dark:text-[#94A3B8]"
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
                      selectedCategory === cat.name ? null : cat.name
                    )
                  }
                  className={`rounded-full px-4 py-2 ${
                    selectedCategory === cat.name
                      ? "bg-[#6b38d4] dark:bg-[#A78BFA]"
                      : "bg-[#f0f3ff] dark:bg-[#1E293B]"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      selectedCategory === cat.name
                        ? "text-white"
                        : "text-[#494454] dark:text-[#94A3B8]"
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
            className="mb-8"
          >
            <Text className="text-xs font-bold text-[#111c2d]/60 dark:text-[#F8FAFC]/60 uppercase tracking-[3px] mb-4">
              Sagas
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 4 }}
            >
              {safeSagas.map((saga, i) => (
                <SagaCard key={saga.id} saga={saga} index={i} />
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Books section */}
        <Animated.View entering={FadeIn.duration(400).delay(180)}>
          <Text className="text-xs font-bold text-[#111c2d]/60 dark:text-[#F8FAFC]/60 uppercase tracking-[3px] mb-4">
            Books
          </Text>

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
