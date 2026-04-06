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
  const { mode } = useAppTheme();
  const insets = useSafeAreaInsets();
  const isDark = mode === "dark";

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
    <View className="flex-1 bg-[#f9f9ff] dark:bg-slate-950">
      <View
        style={{ paddingTop: insets.top + 16 }}
        className="flex-row items-center px-5 pb-4 bg-white dark:bg-slate-900 border-b border-[#E2E8F0] dark:border-slate-800"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 justify-center"
        >
          <Feather name="arrow-left" size={24} color={isDark ? "#F8FAFC" : "#111c2d"} />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-[#111c2d] dark:text-[#F8FAFC] ml-2">
          Reading History
        </Text>
      </View>

      <FlatList
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 20,
        }}
        data={sessions}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View className="h-4" />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={isDark ? "#A78BFA" : "#6b38d4"}
          />
        }
        renderItem={({ item }) => (
          <View className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-[#E2E8F0] dark:border-slate-800">
            <View className="flex-row items-center">
              {/* Thumbnail */}
              <View className="w-[52px] h-[70px] rounded-[10px] bg-[#f0f3ff] dark:bg-white/5 mr-[15px] overflow-hidden justify-center items-center">
                {item.bookCoverUrl ? (
                  <Image
                    source={{ uri: item.bookCoverUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Feather name="book" size={22} color={isDark ? "#94A3B8" : "#494454"} />
                )}
              </View>

              <View className="flex-1 h-[70px] justify-between">
                {/* Top Row: Title and Date */}
                <View className="flex-row justify-between items-center w-full">
                  <Text
                    className="text-[16px] font-bold text-[#111c2d] dark:text-[#F8FAFC] flex-1 mr-2.5"
                    numberOfLines={1}
                  >
                    {item.bookTitle ?? "Unknown Book"}
                  </Text>
                  <Text className="text-[11px] text-[#494454] dark:text-[#94A3B8] font-bold">
                    {formatDate(item.createdAt)}
                  </Text>
                </View>

                {/* Bottom Row: Duration and Pages */}
                <View className="flex-row items-center gap-3.5">
                  <View className="flex-row items-center gap-1.5">
                    <Feather name="clock" size={13} color={isDark ? "#A78BFA" : "#6b38d4"} />
                    <Text className="text-[#494454] dark:text-[#94A3B8] text-[13px] font-semibold">
                      {Math.ceil(item.durationSeconds / 60)} min
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <Feather name="book-open" size={13} color={isDark ? "#A78BFA" : "#6b38d4"} />
                    <Text className="text-[#494454] dark:text-[#94A3B8] text-[13px] font-semibold">
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
            <View className="py-10 items-center">
              <Feather name="book" size={48} color={isDark ? "#334155" : "#E2E8F0"} />
              <Text className="mt-4 text-[#494454] dark:text-[#94A3B8] text-base font-medium">
                No sessions recorded yet.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={() =>
          isFetchingNextPage ? (
            <ActivityIndicator className="my-5" color={isDark ? "#A78BFA" : "#6b38d4"} />
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
