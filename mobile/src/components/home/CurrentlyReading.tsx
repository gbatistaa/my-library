import { View, Text, Image, Pressable } from "react-native";
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
        width: 80,
        height: 120,
        borderRadius: 8,
        backgroundColor: colors.primary + "12",
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
        flexDirection: "row",
        gap: 16,
        alignItems: "flex-start",
      }}
    >
      {book.coverUrl ? (
        <Image
          source={{ uri: book.coverUrl }}
          style={{
            width: 80,
            height: 120,
            borderRadius: 8,
            backgroundColor: colors.border,
          }}
          resizeMode="cover"
        />
      ) : (
        <BookCoverPlaceholder colors={colors} />
      )}

      <View style={{ flex: 1, paddingVertical: 2 }}>
        <Text
          style={{
            fontSize: 17,
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
            fontSize: 13,
            color: colors.textSecondary,
            marginTop: 3,
          }}
          numberOfLines={1}
        >
          {book.author}
        </Text>

        <Text
          style={{
            fontSize: 12,
            fontWeight: "500",
            color: colors.textSecondary,
            marginTop: 10,
          }}
        >
          {book.pages} pages{book.genre ? ` \u00B7 ${book.genre}` : ""}
        </Text>

        <Pressable
          style={({ pressed }) => ({
            marginTop: 14,
            backgroundColor: pressed ? colors.primary + "DD" : colors.primary,
            paddingVertical: 10,
            paddingHorizontal: 18,
            borderRadius: 10,
            alignSelf: "flex-start",
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          })}
        >
          <Feather name="play" size={13} color="#FFFFFF" />
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#FFFFFF" }}>
            Continue Reading
          </Text>
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
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: colors.textSecondary,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          marginBottom: 16,
        }}
      >
        Currently Reading
      </Text>

      {hasBooks ? (
        <View style={{ gap: 24 }}>
          {books.map((book) => (
            <BookCard key={book.id} book={book} colors={colors} />
          ))}
        </View>
      ) : (
        <EmptyState colors={colors} />
      )}
    </Animated.View>
  );
}
