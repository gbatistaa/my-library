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
    <View className="w-24 h-36 rounded-lg items-center justify-center bg-[#f0f3ff] dark:bg-[#1E293B]">
      <Feather name="book" size={28} color={colors.primary + "60"} />
    </View>
  );
}

function BookCard({ book }: { book: BookDTO }) {
  const { colors } = useAppTheme();
  const router = useRouter();

  const handlePress = () => {
    router.push(`/book/${book.id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      className="w-[300px] bg-white dark:bg-[#1E293B] rounded-xl p-4 flex-row gap-4 active:opacity-90 active:scale-[0.98]"
    >
      {/* Cover with page badge overlay */}
      <View className="relative">
        {book.coverUrl ? (
          <Image
            source={{ uri: book.coverUrl }}
            className="w-24 h-36 rounded-lg bg-[#f0f3ff] dark:bg-[#1E293B]"
            resizeMode="cover"
          />
        ) : (
          <BookCoverPlaceholder />
        )}
        {/* Page count badge */}
        {book.pages ? (
          <View
            style={{ backgroundColor: colors.primary + "E6" }}
            className="absolute top-2 left-2 px-2 py-0.5 rounded-full"
          >
            <Text className="text-[10px] font-bold text-white">
              {book.pages} pgs
            </Text>
          </View>
        ) : null}
      </View>

      {/* Info */}
      <View className="flex-1 justify-between py-1">
        <View>
          <Text
            className="text-[18px] font-bold text-[#111c2d] dark:text-[#F8FAFC] tracking-tight leading-[22px]"
            numberOfLines={2}
          >
            {book.title}
          </Text>
          <Text
            className="text-[14px] text-[#494454] dark:text-[#94A3B8] mt-1"
            numberOfLines={1}
          >
            {book.author}
          </Text>
        </View>

        <Pressable
          onPress={handlePress}
          style={({ pressed }) => ({
            backgroundColor: pressed ? colors.primary + "DD" : colors.primary,
          })}
          className="py-2.5 px-4 rounded-lg self-start flex-row items-center justify-center gap-1.5 active:opacity-90"
        >
          <Text className="text-[14px] font-bold text-white">
            Continue
          </Text>
          <Feather name="arrow-right" size={14} color="white" />
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
        className="w-14 h-14 rounded-2xl items-center justify-center"
      >
        <Feather name="book-open" size={24} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-bold text-[#111c2d] dark:text-[#F8FAFC] mb-1">
          Nothing on your nightstand
        </Text>
        <Text className="text-[13px] text-[#494454] dark:text-[#94A3B8] leading-[18px]">
          Add a book and start reading to see it here.
        </Text>
      </View>
    </View>
  );
}

export function CurrentlyReading({ books }: Props) {
  const { colors, mode } = useAppTheme();
  const router = useRouter();
  const hasBooks = books && books.length > 0;

  return (
    <Animated.View entering={FadeIn.duration(400)}>
      {/* Header row */}
      <View className="flex-row justify-between items-end mb-4">
        <Text className="text-[24px] font-bold text-[#111c2d] dark:text-[#F8FAFC] tracking-tight">
          Currently Reading
        </Text>
        <Pressable
          onPress={() => router.push("/(tabs)/library")}
          className="flex-row items-center active:opacity-70 mb-1"
        >
          <Text
            numberOfLines={1}
            className="text-[14px] font-semibold text-[#6b38d4] dark:text-[#A78BFA] mr-0.5"
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
