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
      className="flex-1 gap-[10px] bg-white dark:bg-[#1E293B] p-[14px] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl"
    >
      <View
        className="justify-center items-center rounded-full w-[34px] h-[34px]"
        style={{ backgroundColor: iconBg }}
      >
        <Feather name={iconName} size={16} color={iconColor} />
      </View>

      <View>
        <Text className="font-extrabold text-[#111c2d] text-[22px] dark:text-[#F8FAFC] tracking-tight">
          {value}
        </Text>
        <Text className="mt-[1px] font-semibold text-[#494454] text-[10px] dark:text-[#94A3B8]">
          {unit}
        </Text>
      </View>

      <Text className="font-medium text-[#494454] text-[11px] dark:text-[#94A3B8] leading-[14px]">
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
  CURRENT_WEEK: "This Week",
  CURRENT_MONTH: "This Month",
  CURRENT_YEAR: "This Year",
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
    <View className="flex-1 bg-[#f9f9ff] dark:bg-[#0F172A]">
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
        }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pb-12">
          {/* Header */}
          <View className="mb-6">
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              className="justify-center items-center bg-[rgba(255,255,255,0.1)] mb-5 rounded-full w-10 h-10"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="arrow-left" size={20} color={colors.text} />
            </TouchableOpacity>

            <Text className="font-extrabold text-[#111c2d] text-[26px] dark:text-[#F8FAFC]">
              Reading Analytics
            </Text>
            <Text className="mt-1 text-[#494454] dark:text-[#94A3B8] text-sm">
              Deep dive into your reading habits.
            </Text>
          </View>

          {/* Interval Type Toggle */}
          <View className="flex-row bg-white dark:bg-[#1E293B] mb-3 p-1 border border-[#E2E8F0] dark:border-[#334155] rounded-xl">
            {(["ROLLING", "CURRENT"] as const).map((type) => {
              const isActive = intervalType === type;
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => handleTypeChange(type)}
                  className={`flex-1 py-2 items-center rounded-lg ${isActive ? "bg-[#dee8ff] dark:bg-[#334155]" : ""}`}
                >
                  <Text
                    className={`text-[13px] ${
                      isActive
                        ? "font-bold text-[#111c2d] dark:text-[#F8FAFC]"
                        : "font-medium text-[#494454] dark:text-[#94A3B8]"
                    }`}
                  >
                    {type === "ROLLING" ? "Trailing Window" : "Current Period"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Period Filters */}
          <View className="flex-row bg-white dark:bg-[#1E293B] mb-6 p-1 border border-[#E2E8F0] dark:border-[#334155] rounded-xl">
            {currentActiveFilters.map((f) => {
              const isActive = period === f;
              return (
                <TouchableOpacity
                  key={f}
                  onPress={() => setPeriod(f)}
                  className={`flex-1 py-2 items-center rounded-lg ${isActive ? "bg-[#6b38d4] dark:bg-[#A78BFA]" : ""}`}
                >
                  <Text
                    className={`text-[13px] ${
                      isActive
                        ? "font-bold text-white"
                        : "font-medium text-[#494454] dark:text-[#94A3B8]"
                    }`}
                  >
                    {FILTER_LABELS[f]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Content */}
          <View className="gap-6">
            {isLoading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : isError ? (
              <View className="items-center bg-[#ba1a1a]/10 dark:bg-[#F87171]/10 p-6 rounded-xl">
                <Text className="font-bold text-[#ba1a1a] dark:text-[#F87171] text-base">
                  Failed to load analytics data.
                </Text>
                <Text className="mt-2 text-[#494454] dark:text-[#94A3B8] text-sm text-center">
                  Please check your connection and try again.
                </Text>
              </View>
            ) : (
              <>
                {summary && (
                  <View className="flex-row gap-[10px] mb-2">
                    <SummaryCard
                      iconName="file-text"
                      iconBg={colors.violet100}
                      iconColor={colors.primary}
                      value={summary.totalPagesRead.toLocaleString()}
                      unit="pages"
                      label="Pages Read"
                      delay={80}
                    />
                    <SummaryCard
                      iconName="clock"
                      iconBg={colors.orange100}
                      iconColor={colors.secondary}
                      value={summary.totalActiveMinutes.toLocaleString()}
                      unit="minutes"
                      label="Time Reading"
                      delay={140}
                    />
                    <SummaryCard
                      iconName="zap"
                      iconBg={colors.green100}
                      iconColor={colors.green700}
                      value={summary.avgPagesPerMinute.toFixed(1)}
                      unit="pages / min"
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
