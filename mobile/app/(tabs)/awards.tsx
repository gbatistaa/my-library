import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useState, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
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
  const isDark = mode === "dark";

  const borderColor = isDark
    ? "rgba(167,139,250,0.15)"
    : "rgba(107,56,212,0.12)";
  const bg = isDark ? "rgba(30,41,59,0.6)" : "rgba(237,233,254,0.45)";

  // We no longer need contentAnimatedStyle or useSharedValue with Layout Animations!

  return (
    <Animated.View
      entering={FadeInDown.duration(350)}
      layout={LinearTransition.springify()}
      className={`mb-8 border rounded-2xl overflow-hidden`}
      style={{
        borderColor,
        backgroundColor: bg,
      }}
    >
      {/* Header (Toggle area) */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setIsOpen(!isOpen)}
        className="flex-row justify-between items-center px-4 py-4"
      >
        <Text
          className="font-extrabold text-[11px] uppercase tracking-[2px]"
          style={{ color: colors.primary }}
        >
          {"\u26A1"} How to earn XP
        </Text>
        <Feather
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.primary}
        />
      </TouchableOpacity>

      {/* Collapsible Content */}
      {isOpen && (
        <Animated.View
          entering={FadeIn.duration(250)}
          exiting={FadeOut.duration(200)}
        >
          {/* Divider */}
          <View
            className="mx-4 h-[1px]"
            style={{ backgroundColor: borderColor }}
          />

          {/* Activities */}
          <View className="px-4 pt-4 pb-2">
            <Text
              className="opacity-70 mb-2 font-bold text-[10px] uppercase tracking-[1.5px]"
              style={{ color: colors.primary }}
            >
              Activities
            </Text>
            {ACTIVITY_XP_ROWS.map((row) => (
              <View
                key={row.label}
                className="flex-row justify-between items-center py-1.5"
              >
                <Text
                  className="text-[13px]"
                  style={{ color: isDark ? "#CBD5E1" : "#374151" }}
                >
                  {row.label}
                </Text>
                <Text
                  className="font-bold text-[13px]"
                  style={{ color: colors.primary }}
                >
                  {row.xp}
                </Text>
              </View>
            ))}
          </View>

          {/* Divider */}
          <View
            className="mx-4 h-[1px]"
            style={{ backgroundColor: borderColor }}
          />

          {/* Achievements */}
          <View className="px-4 pt-4 pb-4">
            <Text
              className="opacity-70 mb-2 font-bold text-[10px] uppercase tracking-[1.5px]"
              style={{ color: colors.primary }}
            >
              Achievements
            </Text>
            <View className="flex-col flex-wrap justify-between gap-y-1">
              {ACHIEVEMENT_XP_ROWS.map((row) => (
                <View
                  key={row.name}
                  className="flex-row justify-between items-center"
                >
                  <Text
                    className="text-[13px]"
                    style={{ color: isDark ? "#CBD5E1" : "#374151" }}
                  >
                    {row.name}
                  </Text>
                  <Text
                    className="font-bold text-[13px]"
                    style={{ color: colors.primary }}
                  >
                    +{row.xp} XP
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      )}
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

const CATEGORY_ICON_BG: Record<string, string> = {
  VOLUME: "bg-[#e9ddff]",
  VELOCITY: "bg-[#ffddb8]",
  DIVERSITY: "bg-[#ffd9e4]",
  GOALS: "bg-[#e9ddff]",
};

function getIconBgClass(category: string, earned: boolean): string {
  if (!earned) {
    return "bg-[#dee8ff] dark:bg-slate-800";
  }
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
  const { colors } = useAppTheme();
  const earned = achievement.earned;
  const progress = achievement.progress ?? 0;
  const pct = Math.round(progress * 100);

  const iconBgClass = getIconBgClass(achievement.category, earned);

  return (
    <Animated.View
      entering={FadeInDown.duration(300).delay(index * 40)}
      className={`w-[48%] items-center p-5 rounded-2xl border ${
        earned
          ? "bg-[#6b38d4]/10 border-[#6b38d4]/20 dark:bg-slate-900 dark:border-slate-800"
          : "bg-slate-100/50 border-slate-200/50 dark:bg-slate-900/40 dark:border-slate-800/20 opacity-80"
      }`}
    >
      {/* Icon circle */}
      <View
        className={`w-16 h-16 rounded-full items-center justify-center ${iconBgClass} ${
          !earned ? "opacity-60" : ""
        }`}
      >
        <Text className="text-[30px]">{getAchievementEmoji(achievement)}</Text>
      </View>

      {/* Title */}
      <Text
        className="mt-5 font-bold text-[15px] text-center"
        style={{ color: colors.text }}
        numberOfLines={2}
      >
        {achievement.name}
      </Text>

      {/* Description */}
      <Text
        className="mt-1.5 mb-4 text-[11px] text-center leading-[16px]"
        style={{ color: colors.textSecondary }}
        numberOfLines={3}
      >
        {achievement.description}
      </Text>

      {/* Progress bar */}
      <View
        className="rounded-full w-full h-1.5 overflow-hidden"
        style={{ backgroundColor: colors.surfaceContainerHigh }}
      >
        <View
          className="rounded-full h-full"
          style={{
            width: earned ? "100%" : `${pct}%`,
            backgroundColor: colors.primary,
          }}
        />
      </View>

      {/* Progress label for unearned */}
      {!earned && (
        <Text
          className="mt-2 font-bold text-[10px]"
          style={{ color: colors.primary }}
        >
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
  const { colors } = useAppTheme();

  return (
    <View className="mb-10">
      {/* Category header: emoji + uppercase label */}
      <View className="flex-row items-center gap-2 mb-5">
        <Text className="text-xl">
          {CATEGORY_EMOJIS[category] ?? "\u{1F3C6}"}
        </Text>
        <Text
          className="opacity-60 font-bold text-[11px] uppercase tracking-[2px]"
          style={{ color: colors.text }}
        >
          {CATEGORY_LABELS[category] ?? category}
        </Text>
      </View>

      {/* Achievement grid (2 columns) */}
      <View className="flex-row flex-wrap justify-between gap-y-4">
        {achievements.map((a, i) => (
          <AchievementCard key={a.code} achievement={a} index={i} />
        ))}
      </View>
    </View>
  );
}

function EmptyState() {
  const { colors } = useAppTheme();
  return (
    <View className="items-center py-20">
      <Text className="mb-4 text-[48px]">{"\u{1F3C6}"}</Text>
      <Text
        className="mb-2 font-bold text-[18px]"
        style={{ color: colors.text }}
      >
        No achievements yet
      </Text>
      <Text
        className="max-w-[280px] text-sm text-center leading-[20px]"
        style={{ color: colors.textSecondary }}
      >
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
  const isDark = mode === "dark";

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
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />
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
          className="flex-row justify-between items-center pt-3.5 pb-6"
        >
          <Text
            className="font-extrabold text-[28px] tracking-[-0.5px]"
            style={{ color: colors.text }}
          >
            Achievements
          </Text>
          {total > 0 && (
            <View
              className="px-4 py-1.5 rounded-full"
              style={{ backgroundColor: colors.surfaceContainerLow }}
            >
              <Text
                className="font-bold text-sm"
                style={{ color: colors.primary }}
              >
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
                  className="opacity-40 rounded-2xl"
                  style={{
                    height: h,
                    backgroundColor: colors.surfaceContainerHigh,
                  }}
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
