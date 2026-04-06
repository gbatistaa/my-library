import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { useAppTheme } from "@/src/hooks/useAppTheme";
import type { BookDTO } from "@/src/types/book";

interface Props {
  books: BookDTO[] | undefined;
}

function BookCoverPlaceholder() {
  const { colors } = useAppTheme();
  return (
    <View className="justify-center items-center bg-[#f0f3ff] dark:bg-slate-900 rounded-lg w-24 h-36">
      <Feather name="book" size={28} color={colors.primary + "60"} />
    </View>
  );
}

function BookCard({ book }: { book: BookDTO }) {
  const { colors, mode } = useAppTheme();
  const router = useRouter();

  const handlePress = () => {
    router.push(`/book/${book.id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row gap-4 bg-[#ede9fe] dark:bg-slate-900 active:opacity-90 p-4 rounded-xl w-[300px] active:scale-[0.98]"
    >
      {/* Cover with page badge overlay */}
      <View className="relative">
        {book.coverUrl ? (
          <Image
            source={{ uri: book.coverUrl }}
            className="bg-[#f0f3ff] dark:bg-slate-900 rounded-lg w-24 h-36"
            resizeMode="cover"
          />
        ) : (
          <BookCoverPlaceholder />
        )}
        {/* Page count badge */}
        {book.pages ? (
          <View
            style={{ backgroundColor: colors.primary + "E6" }}
            className="top-2 left-2 absolute px-2 py-0.5 rounded-full"
          >
            <Text className="font-bold text-[10px] text-white">
              {book.pages} pgs
            </Text>
          </View>
        ) : null}
      </View>

      {/* Info */}
      <View className="flex-1 justify-between py-1">
        <View>
          <Text
            className="font-bold text-[#111c2d] text-[18px] dark:text-[#F8FAFC] leading-[22px] tracking-tight"
            numberOfLines={2}
          >
            {book.title}
          </Text>
          <Text
            className="mt-1 text-[#494454] text-[14px] dark:text-[#94A3B8]"
            numberOfLines={1}
          >
            {book.author}
          </Text>
        </View>

        <Pressable
          onPress={handlePress}
          className="flex-row justify-center items-center self-start gap-1.5 px-4 py-2.5 rounded-xl border-[1.5px] border-[#6b38d4]/30 dark:border-[#A78BFA]/30 bg-[#6b38d4]/10 dark:bg-[#A78BFA]/10 active:bg-[#6b38d4]/20 dark:active:bg-[#A78BFA]/20 active:scale-[0.97] transition-all duration-200"
        >
          <Text className="font-bold text-[14px] text-[#6b38d4] dark:text-[#A78BFA]">Continue</Text>
          <Feather 
            name="arrow-right" 
            size={14} 
            color={mode === "dark" ? "#A78BFA" : "#6b38d4"} 
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

function EmptyState() {
  const { colors } = useAppTheme();
  return (
    <View className="flex-row items-center gap-4 py-2">
      <View
        style={{ backgroundColor: colors.primary + "10" }}
        className="justify-center items-center rounded-2xl w-14 h-14"
      >
        <Feather name="book-open" size={24} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="mb-1 font-bold text-[#111c2d] text-[15px] dark:text-[#F8FAFC]">
          Nothing on your nightstand
        </Text>
        <Text className="text-[#494454] text-[13px] dark:text-[#94A3B8] leading-[18px]">
          Add a book and start reading to see it here.
        </Text>
      </View>
    </View>
  );
}

export function CurrentlyReading({ books }: Props) {
  const { mode } = useAppTheme();
  const router = useRouter();
  const hasBooks = books && books.length > 0;

  return (
    <Animated.View entering={FadeIn.duration(400)}>
      {/* Header row */}
      <View className="flex-row justify-between items-end mb-4">
        <Text className="font-bold text-[#111c2d] text-[24px] dark:text-[#F8FAFC] tracking-tight">
          Currently Reading
        </Text>
        <Pressable
          onPress={() => router.push("/(tabs)/library")}
          className="flex-row items-center active:opacity-70 mb-1"
        >
          <Text
            numberOfLines={1}
            className="mr-0.5 font-semibold text-[#6b38d4] text-[14px] dark:text-[#A78BFA]"
            style={{
              includeFontPadding: false,
              textAlignVertical: "center",
            }}
          >
            View Library
          </Text>
          <Feather
            name="chevron-right"
            size={16}
            color={mode === "dark" ? "#A78BFA" : "#6b38d4"}
            style={{
              marginTop: Platform.OS === "ios" ? 1 : 0,
            }}
          />
        </Pressable>
      </View>

      {hasBooks ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 4,
            gap: 16,
          }}
        >
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </ScrollView>
      ) : (
        <EmptyState />
      )}
    </Animated.View>
  );
}
