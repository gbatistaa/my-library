import { View, Text, Image, Pressable, ScrollView } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import type { BookDTO } from "@/src/types/book";

interface Props {
  books: BookDTO[] | undefined;
}

function BookCoverPlaceholder({ colors }: { colors: any }) {
  return (
    <View
      style={{
        width: 96,
        height: 144,
        borderRadius: 8,
        backgroundColor: colors.surfaceContainer,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Feather name="book" size={28} color={colors.primary + "60"} />
    </View>
  );
}

function BookCard({ book, colors }: { book: BookDTO; colors: any }) {
  return (
    <View
      style={{
        width: 300,
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        gap: 16,
      }}
    >
      {/* Cover with page badge overlay */}
      <View style={{ position: "relative" }}>
        {book.coverUrl ? (
          <Image
            source={{ uri: book.coverUrl }}
            style={{
              width: 96,
              height: 144,
              borderRadius: 8,
              backgroundColor: colors.surfaceContainer,
            }}
            resizeMode="cover"
          />
        ) : (
          <BookCoverPlaceholder colors={colors} />
        )}
        {/* Page count badge */}
        {book.pages ? (
          <View
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              backgroundColor: colors.primary + "E6",
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 9999,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color: colors.onPrimary,
              }}
            >
              {book.pages} pgs
            </Text>
          </View>
        ) : null}
      </View>

      {/* Info */}
      <View style={{ flex: 1, justifyContent: "space-between", paddingVertical: 4 }}>
        <View>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: colors.text,
              letterSpacing: -0.3,
              lineHeight: 22,
            }}
            numberOfLines={2}
          >
            {book.title}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              marginTop: 4,
            }}
            numberOfLines={1}
          >
            {book.author}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => ({
            backgroundColor: pressed ? colors.primary + "DD" : colors.primary,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 10,
            alignSelf: "flex-start",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          })}
        >
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.onPrimary }}>
            Continue
          </Text>
          <Feather name="arrow-right" size={14} color={colors.onPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

function EmptyState({ colors }: { colors: any }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        paddingVertical: 8,
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          backgroundColor: colors.primary + "10",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Feather name="book-open" size={24} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: colors.text,
            marginBottom: 3,
          }}
        >
          Nothing on your nightstand
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: colors.textSecondary,
            lineHeight: 18,
          }}
        >
          Add a book and start reading to see it here.
        </Text>
      </View>
    </View>
  );
}

export function CurrentlyReading({ books }: Props) {
  const { colors } = useAppTheme();
  const hasBooks = books && books.length > 0;

  return (
    <Animated.View entering={FadeIn.duration(400)}>
      {/* Header row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: colors.text,
            letterSpacing: -0.5,
          }}
        >
          Currently Reading
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: colors.primary,
          }}
        >
          View Library
        </Text>
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
            <BookCard key={book.id} book={book} colors={colors} />
          ))}
        </ScrollView>
      ) : (
        <EmptyState colors={colors} />
      )}
    </Animated.View>
  );
}
