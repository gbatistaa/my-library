import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

import { useAppTheme } from "@/src/hooks/useAppTheme";
import { fetchReadingSessionHistory } from "@/src/services/readingSessionService";

const SessionHistoryScreen = () => {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["readingSessionHistory"],
    queryFn: async ({ pageParam = 0 }) =>
      fetchReadingSessionHistory(pageParam, 15),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage && !lastPage.last) {
        return (lastPage.pageable?.pageNumber ?? 0) + 1;
      }
      return undefined;
    },
  });

  const sessions = data?.pages.flatMap((p) => p.content ?? []) ?? [];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(
        dateStr.includes("T") ? dateStr : dateStr + "T00:00:00",
      );
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 40, height: 40, justifyContent: "center" }}
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: colors.text,
            marginLeft: 8,
          }}
        >
          Reading History
        </Text>
      </View>

      <FlatList
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 20,
          gap: 16,
        }}
        data={sessions}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: colors.surface,
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {/* Thumbnail */}
              <View
                style={{
                  width: 52,
                  height: 70,
                  borderRadius: 10,
                  backgroundColor: colors.surfaceContainerHigh,
                  marginRight: 15,
                  overflow: "hidden",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {item.bookCoverUrl ? (
                  <Image
                    source={{ uri: item.bookCoverUrl }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                ) : (
                  <Feather name="book" size={22} color={colors.textSecondary} />
                )}
              </View>

              <View style={{ flex: 1, height: 70, justifyContent: "space-between" }}>
                {/* Top Row: Title and Date */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: colors.text,
                      flex: 1,
                      marginRight: 10,
                    }}
                    numberOfLines={1}
                  >
                    {item.bookTitle ?? "Unknown Book"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: colors.textSecondary,
                      fontWeight: "600",
                    }}
                  >
                    {formatDate(item.createdAt)}
                  </Text>
                </View>

                {/* Bottom Row: Duration and Pages */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <Feather name="clock" size={13} color={colors.primary} />
                    <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "500" }}>
                      {Math.ceil(item.durationSeconds / 60)} min
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <Feather name="book-open" size={13} color={colors.primary} />
                    <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "500" }}>
                      {item.pagesRead} pages
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={() =>
          !isLoading ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <Feather name="book" size={48} color={colors.border} />
              <Text
                style={{
                  marginTop: 16,
                  color: colors.textSecondary,
                  fontSize: 16,
                }}
              >
                No sessions recorded yet.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={() =>
          isFetchingNextPage ? (
            <ActivityIndicator
              style={{ marginVertical: 20 }}
              color={colors.primary}
            />
          ) : null
        }
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
      />
    </View>
  );
};

export default SessionHistoryScreen;
