import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";

import { useAppTheme } from "@/src/hooks/useAppTheme";
import { BookClubDTO, BookClubStatus } from "@/src/types/club";

interface BookClubCardProps {
  club: BookClubDTO;
  index: number;
}

const statusConfig: Record<BookClubStatus, { label: string; bg: string; text: string }> = {
  ACTIVE: { label: "ACTIVE", bg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400" },
  INACTIVE: { label: "INACTIVE", bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400" },
  ARCHIVED: { label: "ARCHIVED", bg: "bg-red-100 dark:bg-red-500/20", text: "text-red-600 dark:text-red-400" },
};

export function BookClubCard({ club, index }: BookClubCardProps) {
  const router = useRouter();
  const { colors, mode } = useAppTheme();
  
  const status = statusConfig[club.status] || statusConfig.INACTIVE;
  const hasBook = false; // BookClubDTO doesn't have currentBook info yet

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(index * 50)} className="mb-4">
      <Pressable
        onPress={() => router.push(`/club/${club.id}`)}
        className="active:opacity-80 active:scale-[0.98] transition-transform"
      >
        <View 
          className="rounded-2xl p-5 shadow-sm border"
          style={{ 
            backgroundColor: mode === "dark" ? colors.secondary + "10" : "#ffffff",
            borderColor: colors.border + "60",
          }}
        >
          {/* Header Row: Icon + Name + Badge */}
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-row items-center flex-1 pr-3">
              <View className="justify-center items-center bg-violet-100 dark:bg-violet-900/30 w-10 h-10 rounded-full mr-3">
                <Text className="text-lg">📖</Text>
              </View>
              <Text 
                className="font-bold text-[17px] flex-1" 
                numberOfLines={1}
                style={{ color: colors.text }}
              >
                {club.name}
              </Text>
            </View>
            <View className={`px-2 py-1 rounded-md ${status.bg}`}>
              <Text className={`font-black text-[10px] uppercase tracking-wider ${status.text}`}>
                {status.label}
              </Text>
            </View>
          </View>

          {/* Description */}
          {club.description ? (
            <Text 
              className="text-sm mb-4 leading-5" 
              numberOfLines={2}
              style={{ color: colors.textSecondary }}
            >
              {club.description}
            </Text>
          ) : null}

          {/* Metrics Row */}
          <View className="flex-row items-center mb-4 gap-4">
            <View className="flex-row items-center gap-1.5">
              <Feather name="users" size={14} color={colors.textSecondary} />
              <Text className="font-semibold text-xs" style={{ color: colors.textSecondary }}>
                {club.activeMembersCount}/{club.maxMembers} members
              </Text>
            </View>
            <View className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <View className="flex-row items-center gap-1.5">
              <Feather name="book" size={14} color={colors.textSecondary} />
              <Text className="font-semibold text-xs" style={{ color: colors.textSecondary }}>
                {club.totalBooksCount} books
              </Text>
            </View>
          </View>

          {/* Currently Reading Footer */}
          <View 
            className="rounded-xl px-4 py-3 flex-row items-center"
            style={{ backgroundColor: mode === "dark" ? "rgba(0,0,0,0.2)" : "#f8fafc" }}
          >
            {false ? (
              <View className="flex-1">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                    Reading now: <Text className="font-bold" style={{ color: colors.text }}>{(club as any).currentBook.bookTitle}</Text>
                  </Text>
                  <Text className="text-xs font-bold" style={{ color: colors.primary }}>
                    {(club as any).currentBook.averageProgressPercent}%
                  </Text>
                </View>
                {/* Progress bar */}
                <View className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <View 
                    className="h-full rounded-full" 
                    style={{ 
                      width: `${(club as any).currentBook.averageProgressPercent}%`, 
                      backgroundColor: colors.primary 
                    }} 
                  />
                </View>
              </View>
            ) : (
              <Text className="text-xs font-medium italic" style={{ color: colors.textSecondary }}>
                No active book right now
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
