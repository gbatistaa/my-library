import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { useState, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Animated, { 
  FadeIn, 
  FadeInDown, 
  useAnimatedStyle, 
  withTiming 
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { getAchievements } from "@/src/services/profileService";
import type { AchievementDTO } from "@/src/types/profile";

const CATEGORY_ORDER = ["VOLUME", "VELOCITY", "DIVERSITY", "GOALS"] as const;

const CATEGORY_LABELS: Record<string, string> = {
  VOLUME: "VOLUME",
  VELOCITY: "VELOCITY",
  DIVERSITY: "DIVERSITY",
  GOALS: "GOALS",
};

const CATEGORY_EMOJIS: Record<string, string> = {
  VOLUME: "\u{1F4DA}",
  VELOCITY: "\u26A1",
  DIVERSITY: "\u{1F30D}",
  GOALS: "\u{1F3AF}",
};

const ACHIEVEMENT_EMOJIS: Record<string, string> = {
  Bookworm: "\u{1F4D6}",
  "Library Titan": "\u{1F3DB}\uFE0F",
  "Speed Reader": "\u{1F3CE}\uFE0F",
  "On Fire": "\u{1F525}",
  Historian: "\u{1F3FA}",
  "Future Seeker": "\u{1F6F8}",
  "New Year Pro": "\u{1F3C5}",
  "Peak Focus": "\u{1F9D7}",
};

// ─── XP Legend data ───────────────────────────────────────────────────────────

const ACTIVITY_XP_ROWS = [
  { label: "Each page read", xp: "+1 XP / page" },
  { label: "Book completed", xp: "+100 XP" },
  { label: "Daily reading streak", xp: "+50 XP" },
];

const ACHIEVEMENT_XP_ROWS = [
  { name: "First Book", xp: 50 },
  { name: "Comeback Kid", xp: 75 },
  { name: "Habit Formed (7d streak)", xp: 100 },
  { name: "Marathon (3h session)", xp: 100 },
  { name: "Contrarian", xp: 150 },
  { name: "Genre Explorer", xp: 150 },
  { name: "Speed Demon", xp: 150 },
  { name: "Binge Reader", xp: 200 },
  { name: "New Voice (10 authors)", xp: 200 },
  { name: "Saga Slayer", xp: 200 },
  { name: "Goal Crusher", xp: 250 },
  { name: "Bookworm (10 books)", xp: 300 },
  { name: "DNF Zero", xp: 300 },
  { name: "Iron Reader (30d streak)", xp: 350 },
  { name: "Page Turner (10k pages)", xp: 500 },
  { name: "Centurion (100 books)", xp: 1000 },
];

function XpLegendSection() {
  const { colors, mode } = useAppTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  const borderColor =
    mode === "dark" ? "rgba(167,139,250,0.15)" : "rgba(107,56,212,0.12)";
  const bg =
    mode === "dark" ? "rgba(30,41,59,0.6)" : "rgba(237,233,254,0.45)";
  const headerColor = colors.primary;
  const labelColor = mode === "dark" ? "#CBD5E1" : "#374151";

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(isOpen ? 640 : 0, { duration: 300 }), // ~640 is enough for all rows
      opacity: withTiming(isOpen ? 1 : 0, { duration: 250 }),
      overflow: "hidden",
    };
  });

  return (
    <Animated.View
      entering={FadeInDown.duration(350)}
      style={{
        marginBottom: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor,
        backgroundColor: bg,
      }}
    >
      {/* Header (Toggle area) */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setIsOpen(!isOpen)}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 14,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            fontWeight: "800",
            color: headerColor,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          {"\u26A1"} How to earn XP
        </Text>
        <Feather name={isOpen ? "chevron-up" : "chevron-down"} size={16} color={headerColor} />
      </TouchableOpacity>

      {/* Collapsible Content */}
      <Animated.View style={contentAnimatedStyle}>
        {/* Divider */}
        <View style={{ height: 1, backgroundColor: borderColor, marginHorizontal: 16 }} />

        {/* Activities */}
        <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              color: headerColor,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 8,
              opacity: 0.7,
            }}
          >
            Activities
          </Text>
          {ACTIVITY_XP_ROWS.map((row) => (
            <View
              key={row.label}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 6,
              }}
            >
              <Text style={{ fontSize: 13, color: labelColor }}>{row.label}</Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: headerColor }}>
                {row.xp}
              </Text>
            </View>
          ))}
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: borderColor, marginHorizontal: 16 }} />

        {/* Achievements */}
        <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16 }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              color: headerColor,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 8,
              opacity: 0.7,
            }}
          >
            Achievements
          </Text>
          {ACHIEVEMENT_XP_ROWS.map((row) => (
            <View
              key={row.name}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 6,
              }}
            >
              <Text style={{ fontSize: 13, color: labelColor }}>{row.name}</Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: headerColor }}>
                +{row.xp} XP
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

function getAchievementEmoji(achievement: AchievementDTO): string {
  return (
    ACHIEVEMENT_EMOJIS[achievement.name] ??
    CATEGORY_EMOJIS[achievement.category] ??
    "\u{1F3C6}"
  );
}

/* ── Icon bg class per category (earned, light mode) ── */
const CATEGORY_ICON_BG: Record<string, string> = {
  VOLUME: "bg-[#e9ddff]",
  VELOCITY: "bg-[#ffddb8]",
  DIVERSITY: "bg-[#ffd9e4]",
  GOALS: "bg-[#e9ddff]",
};

function getIconBgClass(category: string, earned: boolean): string {
  if (!earned) {
    // unearned: surfaceContainerHigh
    return "bg-[#dee8ff] dark:bg-slate-800";
  }
  // earned dark: primary/33
  // earned light: category-based
  const lightBg = CATEGORY_ICON_BG[category] ?? "bg-[#e9ddff]";
  return `${lightBg} dark:bg-[#A78BFA]/20`;
}

function AchievementCard({
  achievement,
  index,
}: {
  achievement: AchievementDTO;
  index: number;
}) {
  const earned = achievement.earned;
  const progress = achievement.progress ?? 0;
  const pct = Math.round(progress * 100);

  const cardClass = earned
    ? "bg-[#ede9fe] dark:bg-slate-900 dark:border dark:border-slate-800"
    : "bg-[#ede9fe]/60 dark:bg-slate-900/40 border border-[#cbc3d7]/10 dark:border-slate-800/20 opacity-80";

  const iconBgClass = getIconBgClass(achievement.category, earned);

  return (
    <Animated.View
      entering={FadeInDown.duration(300).delay(index * 40)}
      className={`w-[48%] items-center p-5 rounded-xl ${cardClass}`}
    >
      {/* Icon circle */}
      <View
        className={`w-16 h-16 rounded-full items-center justify-center ${iconBgClass} ${!earned ? "opacity-60" : ""}`}
      >
        <Text className="text-[28px]">
          {getAchievementEmoji(achievement)}
        </Text>
      </View>

      {/* Title */}
      <Text
        className="font-bold text-[#111c2d] dark:text-[#F8FAFC] text-center mt-4"
        numberOfLines={2}
      >
        {achievement.name}
      </Text>

      {/* Description */}
      <Text
        className="text-xs text-[#494454] dark:text-[#94A3B8] text-center leading-[18px] mt-1 mb-3"
        numberOfLines={3}
      >
        {achievement.description}
      </Text>

      {/* Progress bar */}
      <View className="w-full h-1.5 rounded-full bg-[#6b38d4]/10 dark:bg-[#A78BFA]/10 overflow-hidden">
        <View
          className="h-full rounded-full bg-[#6b38d4] dark:bg-[#A78BFA]"
          style={{ width: earned ? "100%" : `${pct}%` }}
        />
      </View>

      {/* Progress label for unearned */}
      {!earned && (
        <Text className="text-[10px] font-bold text-[#6b38d4] dark:text-[#A78BFA] mt-2">
          {achievement.progressLabel || `${pct}%`}
        </Text>
      )}
    </Animated.View>
  );
}

function CategoryGroup({
  category,
  achievements,
}: {
  category: string;
  achievements: AchievementDTO[];
}) {
  return (
    <View className="mb-12">
      {/* Category header: emoji + uppercase label */}
      <View className="flex-row items-center gap-2 mb-6">
        <Text className="text-xl">
          {CATEGORY_EMOJIS[category] ?? "\u{1F3C6}"}
        </Text>
        <Text className="text-xs font-bold text-[#111c2d]/60 dark:text-[#F8FAFC]/60 uppercase tracking-[3px]">
          {CATEGORY_LABELS[category] ?? category}
        </Text>
      </View>

      {/* Achievement grid (2 columns) */}
      <View className="flex-row flex-wrap justify-between gap-4">
        {achievements.map((a, i) => (
          <AchievementCard
            key={a.code}
            achievement={a}
            index={i}
          />
        ))}
      </View>
    </View>
  );
}

function EmptyState() {
  return (
    <View className="py-[60px] items-center">
      <Text className="text-[40px] mb-4">{"\u{1F3C6}"}</Text>
      <Text className="text-[17px] font-semibold text-[#111c2d] dark:text-[#F8FAFC] mb-1.5">
        No achievements yet
      </Text>
      <Text className="text-sm text-[#494454] dark:text-[#94A3B8] text-center leading-5 max-w-[260px]">
        Start reading to unlock your first badges. There are 16 to collect!
      </Text>
    </View>
  );
}

export default function AchievementsScreen() {
  const { colors, mode } = useAppTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: achievements, isLoading } = useQuery({
    queryKey: ["achievements"],
    queryFn: getAchievements,
    retry: 1,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["achievements"] });
    setRefreshing(false);
  }, [queryClient]);

  const safeAchievements = Array.isArray(achievements) ? achievements : [];
  const earnedTotal = safeAchievements.filter((a) => a.earned).length;
  const total = safeAchievements.length;

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: safeAchievements.filter((a) => a.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 48,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(400)}
          className="pt-3.5 pb-6 flex-row justify-between items-center"
        >
          <Text className="text-[28px] font-extrabold text-[#111c2d] dark:text-[#F8FAFC] tracking-[-0.5px]">
            Achievements
          </Text>
          {total > 0 && (
            <View className="bg-[#6b38d4]/10 dark:bg-[#A78BFA]/10 px-4 py-1.5 rounded-full">
              <Text className="text-sm font-bold text-[#6b38d4] dark:text-[#A78BFA]">
                {earnedTotal} / {total} earned
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Content */}
        <View>
          {isLoading ? (
            <View className="gap-4 pt-5">
              {[120, 100, 140, 100].map((h, i) => (
                <View
                  key={i}
                  className="rounded-xl bg-slate-200/40 dark:bg-slate-900/40 opacity-50"
                  style={{ height: h }}
                />
              ))}
            </View>
          ) : grouped.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <XpLegendSection />
              {grouped.map((g) => (
                <CategoryGroup
                  key={g.category}
                  category={g.category}
                  achievements={g.items}
                />
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
