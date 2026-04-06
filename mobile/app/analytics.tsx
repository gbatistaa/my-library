import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import {
  getAnalyticsSummary,
  getAnalyticsTrends,
  getAnalyticsDistribution,
  getAnalyticsHeatmap,
} from "@/src/services/analyticsService";
import { AnalyticsCharts } from "@/src/components/analytics/AnalyticsCharts";
import { Heatmap } from "@/src/components/analytics/Heatmap";

interface SummaryCardProps {
  iconName: React.ComponentProps<typeof Feather>["name"];
  iconBg: string;
  iconColor: string;
  value: string;
  unit: string;
  label: string;
  delay: number;
}

function SummaryCard({
  iconName,
  iconBg,
  iconColor,
  value,
  unit,
  label,
  delay,
}: SummaryCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(350).delay(delay)}
      className="flex-1 gap-2 bg-white dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800/50 rounded-2xl shadow-sm"
    >
      <View
        className="justify-center items-center rounded-full w-9 h-9"
        style={{ backgroundColor: iconBg }}
      >
        <Feather name={iconName} size={16} color={iconColor} />
      </View>

      <View>
        <Text className="font-extrabold text-slate-900 dark:text-slate-50 text-xl tracking-tight">
          {value}
        </Text>
        <Text className="mt-0.5 font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">
          {unit}
        </Text>
      </View>

      <Text className="font-medium text-slate-600 dark:text-slate-400 text-xs leading-4">
        {label}
      </Text>
    </Animated.View>
  );
}

const ROLLING_FILTERS = ["WEEK", "MONTH", "HALF_YEAR", "YEAR"];
const CURRENT_FILTERS = ["CURRENT_WEEK", "CURRENT_MONTH", "CURRENT_YEAR"];

const FILTER_LABELS: Record<string, string> = {
  WEEK: "7 Days",
  MONTH: "30 Days",
  HALF_YEAR: "6 Mos",
  YEAR: "1 Year",
  CURRENT_WEEK: "Week",
  CURRENT_MONTH: "Month",
  CURRENT_YEAR: "Year",
};

function getDynamicChartSubtitle(period: string): string {
  const today = new Date();
  const formatMonthYear = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const formatDayMonth = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const getPastDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  };
  const getPastMonth = (months: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    return d;
  };
  const getPastYear = (years: number) => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - years);
    return d;
  };

  switch (period) {
    case "WEEK":
      return `${formatDayMonth(getPastDate(7))} - ${formatDayMonth(today)}`;
    case "MONTH":
      return `${formatDayMonth(getPastDate(30))} - ${formatDayMonth(today)}`;
    case "HALF_YEAR":
      return `${formatMonthYear(getPastMonth(6))} - ${formatMonthYear(today)}`;
    case "YEAR":
      return `${formatMonthYear(getPastYear(1))} - ${formatMonthYear(today)}`;
    case "CURRENT_WEEK": {
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      return `${formatDayMonth(monday)} - ${formatDayMonth(new Date())}`;
    }
    case "CURRENT_MONTH":
      return today.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    case "CURRENT_YEAR":
      return today.getFullYear().toString();
    default:
      return "";
  }
}

export default function AnalyticsScreen() {
  const { colors, mode } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [intervalType, setIntervalType] = useState<"ROLLING" | "CURRENT">(
    "ROLLING",
  );
  const [period, setPeriod] = useState("MONTH");

  const handleTypeChange = (type: "ROLLING" | "CURRENT") => {
    if (type === intervalType) return;
    setIntervalType(type);
    setPeriod(type === "ROLLING" ? "MONTH" : "CURRENT_MONTH");
  };

  const {
    data: summary,
    isLoading: loadingSummary,
    isError: errSummary,
  } = useQuery({
    queryKey: ["analytics-summary", period],
    queryFn: () => getAnalyticsSummary(period),
  });
  const {
    data: pagesTrend,
    isLoading: loadingPages,
    isError: errPages,
  } = useQuery({
    queryKey: ["analytics-trends", "PAGES", period],
    queryFn: () => getAnalyticsTrends("PAGES", period),
  });
  const {
    data: timeTrend,
    isLoading: loadingTime,
    isError: errTime,
  } = useQuery({
    queryKey: ["analytics-trends", "TIME", period],
    queryFn: () => getAnalyticsTrends("TIME", period),
  });
  const {
    data: velocityTrend,
    isLoading: loadingVelocity,
    isError: errVelocity,
  } = useQuery({
    queryKey: ["analytics-trends", "VELOCITY", period],
    queryFn: () => getAnalyticsTrends("VELOCITY", period),
  });
  const {
    data: distribution,
    isLoading: loadingDist,
    isError: errDist,
  } = useQuery({
    queryKey: ["analytics-distribution"],
    queryFn: () => getAnalyticsDistribution(),
  });
  const {
    data: heatmapData,
    isLoading: loadingHeatmap,
    isError: errHeatmap,
  } = useQuery({
    queryKey: ["analytics-heatmap", new Date().getFullYear()],
    queryFn: () => getAnalyticsHeatmap(new Date().getFullYear()),
  });

  const isLoading =
    loadingSummary ||
    loadingPages ||
    loadingTime ||
    loadingVelocity ||
    loadingDist ||
    loadingHeatmap;
  const isError =
    errSummary || errPages || errTime || errVelocity || errDist || errHeatmap;
  const currentActiveFilters =
    intervalType === "ROLLING" ? ROLLING_FILTERS : CURRENT_FILTERS;

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 20,
        }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5">
          {/* Header */}
          <View className="mb-6 flex-row items-center justify-between">
            <View className="flex-1">
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.7}
                className="justify-center items-center bg-slate-200/50 dark:bg-slate-800/50 mb-5 rounded-full w-10 h-10"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="arrow-left" size={20} color={colors.text} />
              </TouchableOpacity>

              <Text className="font-extrabold text-slate-900 dark:text-slate-50 text-3xl tracking-tight">
                Analytics
              </Text>
              <Text className="mt-1 text-slate-500 dark:text-slate-400 text-sm">
                Deep dive into your reading habits.
              </Text>
            </View>
            <View className="justify-center items-center bg-violet-100 dark:bg-violet-900/30 w-12 h-12 rounded-2xl">
              <Feather name="bar-chart-2" size={24} color={mode === "dark" ? "#A78BFA" : "#6b38d4"} />
            </View>
          </View>

          {/* Type Toggle */}
          <View className="flex-row bg-slate-200/50 dark:bg-slate-900/50 mb-3 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800">
            {(["ROLLING", "CURRENT"] as const).map((type) => {
              const isActive = intervalType === type;
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => handleTypeChange(type)}
                  className={`flex-1 py-2.5 items-center rounded-lg ${isActive ? "bg-white dark:bg-slate-900 shadow-sm" : ""}`}
                >
                  <Text
                    className={`text-xs ${
                      isActive
                        ? "font-bold text-slate-900 dark:text-slate-50"
                        : "font-semibold text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {type === "ROLLING" ? "Floating Window" : "Current Period"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Period Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mb-6"
            contentContainerStyle={{ gap: 8 }}
          >
            {currentActiveFilters.map((f) => {
              const isActive = period === f;
              return (
                <TouchableOpacity
                  key={f}
                  onPress={() => setPeriod(f)}
                  className={`px-5 py-2 rounded-full border ${
                    isActive 
                      ? "bg-violet-600 border-violet-600" 
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      isActive ? "text-white" : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {FILTER_LABELS[f]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Content */}
          <View className="gap-6">
            {isLoading ? (
              <View className="py-12 items-center">
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : isError ? (
              <View className="items-center bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/20">
                <Feather name="alert-circle" size={24} color="#ef4444" />
                <Text className="mt-3 font-bold text-red-600 dark:text-red-400 text-base">
                  Failed to load analytics
                </Text>
                <Text className="mt-1 text-red-500/70 dark:text-red-400/50 text-xs text-center">
                  Check your connection and try again
                </Text>
              </View>
            ) : (
              <>
                {summary && (
                  <View className="flex-row gap-2.5 mb-2">
                    <SummaryCard
                      iconName="file-text"
                      iconBg={mode === 'dark' ? 'rgba(124, 77, 255, 0.15)' : '#ede9fe'}
                      iconColor={mode === 'dark' ? '#A78BFA' : '#6b38d4'}
                      value={summary.totalPagesRead.toLocaleString()}
                      unit="pages"
                      label="Pages Read"
                      delay={80}
                    />
                    <SummaryCard
                      iconName="clock"
                      iconBg={mode === 'dark' ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7'}
                      iconColor={mode === 'dark' ? '#FBBF24' : '#d97706'}
                      value={summary.totalActiveMinutes.toLocaleString()}
                      unit="mins"
                      label="Reading Time"
                      delay={140}
                    />
                    <SummaryCard
                      iconName="zap"
                      iconBg={mode === 'dark' ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7'}
                      iconColor={mode === 'dark' ? '#34D399' : '#15803d'}
                      value={summary.avgPagesPerMinute.toFixed(1)}
                      unit="pg/min"
                      label="Avg Pace"
                      delay={200}
                    />
                  </View>
                )}

                <AnalyticsCharts
                  pagesTrend={pagesTrend}
                  timeTrend={timeTrend}
                  velocityTrend={velocityTrend}
                  distribution={distribution}
                  chartSubtitle={getDynamicChartSubtitle(period)}
                />

                {heatmapData && <Heatmap data={heatmapData.days} />}
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
