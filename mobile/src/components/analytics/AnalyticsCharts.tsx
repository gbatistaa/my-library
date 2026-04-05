import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  Switch,
} from "react-native";
import { LineChart, BarChart, PieChart } from "react-native-gifted-charts";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { useAtom } from "jotai";
import AsyncStorage from "@react-native-async-storage/async-storage";

const storage = createJSONStorage<any>(() => AsyncStorage);

const smoothCurveAtom = atomWithStorage(
  "analytics_smooth_curve",
  true,
  storage,
);
const pagesChartColorAtom = atomWithStorage(
  "analytics_pages_color",
  "#8b5cf6",
  storage,
);
const timeChartColorAtom = atomWithStorage(
  "analytics_time_color",
  "#3b82f6",
  storage,
);
const velocityChartColorAtom = atomWithStorage(
  "analytics_velocity_color",
  "#ec4899",
  storage,
);

const PRESET_COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
];

function getFilteredData(raw: any[]): any[] {
  if (raw.length <= 12) return raw;
  const step = Math.ceil(raw.length / 6);
  return raw.map((item, index) => ({
    ...item,
    label: index % step === 0 ? item.label : "",
  }));
}

interface AnalyticsChartsProps {
  pagesTrend: any;
  timeTrend: any;
  velocityTrend: any;
  distribution: any;
  chartSubtitle: string;
}

function ChartSubtitle({ title, text }: { title: string; text: string }) {
  return (
    <View className="mt-0.5 mb-4">
      <Text className="font-semibold text-[#6b38d4] text-[13px] dark:text-[#A78BFA] leading-tight">
        {title}
      </Text>
      <Text className="mt-0.5 text-[#494454] dark:text-[#94A3B8] text-xs leading-tight">
        {text}
      </Text>
    </View>
  );
}

function calcYAxis(maxVal: number) {
  if (maxVal === 0) return { maxValue: 5, noOfSections: 5 };
  const target = Math.ceil((maxVal + 5) / 5) * 5;
  return { maxValue: target, noOfSections: 5 };
}

function ColorPickerRow({
  selectedColor,
  onSelectColor,
}: {
  selectedColor: string;
  onSelectColor: (c: string) => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View className="flex-row gap-2 mt-2">
      {PRESET_COLORS.map((c) => (
        <TouchableOpacity
          key={c}
          activeOpacity={0.7}
          onPress={() => onSelectColor(c)}
          className="border-2 rounded-full w-5 h-5"
          style={{
            backgroundColor: c,
            borderColor: selectedColor === c ? colors.text : "transparent",
          }}
        />
      ))}
    </View>
  );
}

export function AnalyticsCharts({
  pagesTrend,
  timeTrend,
  velocityTrend,
  distribution,
  chartSubtitle,
}: AnalyticsChartsProps) {
  const { colors } = useAppTheme();
  const { width: screenWidth } = useWindowDimensions();
  const chartAvailableWidth = screenWidth - 110;

  const [isSmooth, setIsSmooth] = useAtom(smoothCurveAtom);
  const [pagesColor, setPagesColor] = useAtom(pagesChartColorAtom);
  const [timeColor, setTimeColor] = useAtom(timeChartColorAtom);
  const [velocityColor, setVelocityColor] = useAtom(velocityChartColorAtom);

  const formatNum = useCallback(
    (num: number) =>
      Number.isInteger(num)
        ? num.toString()
        : num.toFixed(2).replace(/\.00$/, ""),
    [],
  );

  const pagesData = useMemo(
    () =>
      getFilteredData(
        pagesTrend?.data?.map((d: any) => ({
          value: d.value,
          label: d.label,
        })) ?? [],
      ),
    [pagesTrend?.data],
  );
  const timeData = useMemo(
    () =>
      getFilteredData(
        timeTrend?.data?.map((d: any) => ({
          value: d.value,
          label: d.label,
          frontColor: timeColor,
        })) ?? [],
      ),
    [timeTrend?.data, timeColor],
  );
  const velocityData = useMemo(
    () =>
      getFilteredData(
        velocityTrend?.data?.map((d: any) => ({
          value: d.value,
          label: d.label,
        })) ?? [],
      ),
    [velocityTrend?.data],
  );

  const lineSpacingPages = Math.max(
    (chartAvailableWidth - 20) / Math.max(pagesData.length - 1, 1),
    2,
  );
  const lineSpacingVelocity = Math.max(
    (chartAvailableWidth - 20) / Math.max(velocityData.length - 1, 1),
    2,
  );
  const barSpacing = Math.max(
    (chartAvailableWidth / Math.max(timeData.length, 1)) * 0.4,
    2,
  );
  const barWidth = Math.max(
    (chartAvailableWidth / Math.max(timeData.length, 1)) * 0.6,
    2,
  );

  const pagesAvg = useMemo(
    () =>
      pagesData.length > 0
        ? pagesData.reduce((s: number, d: any) => s + d.value, 0) /
          pagesData.length
        : 0,
    [pagesData],
  );
  const pagesMax = useMemo(
    () =>
      pagesData.length > 0
        ? Math.max(...pagesData.map((d: any) => d.value))
        : 0,
    [pagesData],
  );
  const timeAvg = useMemo(
    () =>
      timeData.length > 0
        ? timeData.reduce((s: number, d: any) => s + d.value, 0) /
          timeData.length
        : 0,
    [timeData],
  );
  const timeMax = useMemo(
    () =>
      timeData.length > 0 ? Math.max(...timeData.map((d: any) => d.value)) : 0,
    [timeData],
  );
  const velocityAvg = useMemo(
    () =>
      velocityData.length > 0
        ? velocityData.reduce((s: number, d: any) => s + d.value, 0) /
          velocityData.length
        : 0,
    [velocityData],
  );
  const velocityMax = useMemo(
    () =>
      velocityData.length > 0
        ? Math.max(...velocityData.map((d: any) => d.value))
        : 0,
    [velocityData],
  );

  // Reference line configs use library-specific JS objects — colors stay as values
  const makeRefLineConfig = useCallback(
    (label: string) => ({
      thickness: 1.5,
      color: colors.textSecondary + "70",
      type: "dashed",
      dashWidth: 5,
      dashGap: 4,
      labelText: label,
      labelTextStyle: {
        color: colors.textSecondary,
        fontSize: 9,
        fontWeight: "600" as const,
      },
    }),
    [colors.textSecondary],
  );

  const pagesRefConfig = useMemo(
    () => makeRefLineConfig(`Avg ${formatNum(pagesAvg)}`),
    [makeRefLineConfig, formatNum, pagesAvg],
  );
  const timeRefConfig = useMemo(
    () => makeRefLineConfig(`Avg ${formatNum(timeAvg)}m`),
    [makeRefLineConfig, formatNum, timeAvg],
  );
  const velocityRefConfig = useMemo(
    () => makeRefLineConfig(`Avg ${formatNum(velocityAvg)}`),
    [makeRefLineConfig, formatNum, velocityAvg],
  );

  // Pointer configs: JSX uses className — no colors.* deps needed
  const pagesPointerConfig = useMemo(
    () => ({
      pointerStripHeight: 160,
      pointerStripColor: "lightgray",
      pointerStripWidth: 2,
      pointerColor: "lightgray",
      radius: 6,
      pointerLabelWidth: 80,
      pointerLabelHeight: 40,
      activatePointersOnLongPress: true,
      autoAdjustPointerLabelPosition: true,
      pointerLabelComponent: (items: any) => (
        <View className="justify-center bg-white dark:bg-[#1E293B] px-1 border border-[#E2E8F0] dark:border-[#334155] rounded-lg w-[70px] h-10">
          <Text className="font-bold text-[#111c2d] text-[11px] dark:text-[#F8FAFC] text-center">
            {formatNum(items[0].value)} pg
          </Text>
        </View>
      ),
    }),
    [formatNum],
  );

  const timePointerConfig = useMemo(
    () => ({
      pointerStripHeight: 160,
      pointerStripWidth: 2,
      activatePointersOnLongPress: true,
      autoAdjustPointerLabelPosition: true,
      pointerLabelWidth: 80,
      pointerLabelHeight: 40,
      pointerLabelComponent: (items: any) => (
        <View className="justify-center bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-lg w-[70px] h-10">
          <Text className="font-bold text-[#111c2d] text-[11px] dark:text-[#F8FAFC] text-center">
            {formatNum(items[0].value)} min
          </Text>
        </View>
      ),
    }),
    [formatNum],
  );

  const velocityPointerConfig = useMemo(
    () => ({
      pointerStripHeight: 160,
      pointerStripWidth: 2,
      activatePointersOnLongPress: true,
      autoAdjustPointerLabelPosition: true,
      pointerLabelWidth: 80,
      pointerLabelHeight: 40,
      pointerLabelComponent: (items: any) => (
        <View className="justify-center bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-lg w-[75px] h-10">
          <Text className="font-bold text-[#111c2d] text-[11px] dark:text-[#F8FAFC] text-center">
            {formatNum(items[0].value)} p/m
          </Text>
        </View>
      ),
    }),
    [formatNum],
  );

  const rawGenres = distribution?.genres ?? [];
  const MAX_GENRES = 5;
  const visibleGenres = rawGenres.slice(0, MAX_GENRES);
  const othersCount = rawGenres
    .slice(MAX_GENRES)
    .reduce((sum: number, g: any) => sum + g.count, 0);
  const othersPercentage = rawGenres
    .slice(MAX_GENRES)
    .reduce((sum: number, g: any) => sum + g.percentage, 0);

  const pieData = useMemo(
    () => [
      ...visibleGenres.map((g: any, index: number) => ({
        value: g.count,
        text: `${g.percentage.toFixed(0)}%`,
        color: PRESET_COLORS[index % PRESET_COLORS.length],
        label: g.name,
        percentage: g.percentage,
      })),
      ...(othersCount > 0
        ? [
            {
              value: othersCount,
              text: `${othersPercentage.toFixed(0)}%`,
              color: "#94a3b8",
              label: "Others",
              percentage: othersPercentage,
            },
          ]
        : []),
    ],
    [visibleGenres, othersCount, othersPercentage],
  );

  const languageData = distribution?.languages ?? [];

  return (
    <View className="gap-6">
      {/* Smooth curve toggle */}
      <View className="flex-row justify-between items-center bg-white dark:bg-[#1E293B] p-3 border border-[#E2E8F0] dark:border-[#334155] rounded-2xl">
        <Text className="font-semibold text-[#111c2d] text-[13px] dark:text-[#F8FAFC]">
          Smooth Analytics Curves
        </Text>
        <Switch
          value={isSmooth}
          onValueChange={setIsSmooth}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.onPrimary}
        />
      </View>

      {/* Pages Read */}
      <View className="bg-white dark:bg-[#1E293B] p-4 border border-[#E2E8F0] dark:border-[#334155] rounded-2xl">
        <View className="flex-row justify-between items-start mb-[6px]">
          <View>
            <Text className="font-bold text-[#111c2d] dark:text-[#F8FAFC] text-base">
              Pages Read
            </Text>
            <ChartSubtitle
              title={chartSubtitle}
              text={`Avg ${formatNum(pagesAvg)} pages · peak ${formatNum(pagesMax)} pages`}
            />
          </View>
          <ColorPickerRow
            selectedColor={pagesColor}
            onSelectColor={setPagesColor}
          />
        </View>
        {pagesData.length > 0 ? (
          <LineChart
            curved={isSmooth}
            isAnimated
            areaChart
            data={pagesData}
            width={chartAvailableWidth}
            initialSpacing={20}
            endSpacing={20}
            spacing={lineSpacingPages}
            startFillColor={pagesColor}
            startOpacity={0.8}
            endFillColor={pagesColor}
            endOpacity={0.1}
            color={pagesColor}
            thickness={3}
            disableScroll
            hideRules={false}
            rulesType="solid"
            rulesColor={colors.border}
            yAxisColor="transparent"
            xAxisColor={colors.border}
            yAxisLabelWidth={30}
            yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
            xAxisLabelTextStyle={{
              color: colors.textSecondary,
              fontSize: 9,
              width: 40,
              textAlign: "center",
            }}
            showReferenceLine1={pagesAvg > 0}
            referenceLine1Position={pagesAvg}
            referenceLine1Config={pagesRefConfig}
            pointerConfig={pagesPointerConfig}
            {...calcYAxis(pagesMax)}
          />
        ) : (
          <Text className="text-[#494454] dark:text-[#94A3B8]">
            No data available
          </Text>
        )}
      </View>

      {/* Time Reading */}
      <View className="bg-white dark:bg-[#1E293B] p-4 border border-[#E2E8F0] dark:border-[#334155] rounded-2xl">
        <View className="flex-row justify-between items-start mb-[6px]">
          <View>
            <Text className="font-bold text-[#111c2d] dark:text-[#F8FAFC] text-base">
              Time Reading
            </Text>
            <ChartSubtitle
              title={chartSubtitle}
              text={`Avg ${formatNum(timeAvg)} min · peak ${formatNum(timeMax)} min`}
            />
          </View>
          <ColorPickerRow
            selectedColor={timeColor}
            onSelectColor={setTimeColor}
          />
        </View>
        {timeData.length > 0 ? (
          <BarChart
            isAnimated
            data={timeData}
            width={chartAvailableWidth}
            initialSpacing={15}
            endSpacing={20}
            barWidth={barWidth}
            spacing={barSpacing}
            roundedTop
            disableScroll
            hideRules={false}
            rulesType="solid"
            rulesColor={colors.border}
            xAxisThickness={1}
            yAxisThickness={0}
            yAxisLabelWidth={30}
            yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
            xAxisLabelTextStyle={{
              color: colors.textSecondary,
              fontSize: 9,
              width: 40,
              textAlign: "center",
            }}
            xAxisColor={colors.border}
            showReferenceLine1={timeAvg > 0}
            referenceLine1Position={timeAvg}
            referenceLine1Config={timeRefConfig}
            pointerConfig={timePointerConfig}
            {...calcYAxis(timeMax)}
          />
        ) : (
          <Text className="text-[#494454] dark:text-[#94A3B8]">
            No data available
          </Text>
        )}
      </View>

      {/* Pace */}
      <View className="bg-white dark:bg-[#1E293B] p-4 border border-[#E2E8F0] dark:border-[#334155] rounded-2xl">
        <View className="flex-row justify-between items-start mb-[6px]">
          <View>
            <Text className="font-bold text-[#111c2d] dark:text-[#F8FAFC] text-base">
              Pace (Pages/Min)
            </Text>
            <ChartSubtitle
              title={chartSubtitle}
              text={`Avg ${formatNum(velocityAvg)} p/min · peak ${formatNum(velocityMax)} p/min`}
            />
          </View>
          <ColorPickerRow
            selectedColor={velocityColor}
            onSelectColor={setVelocityColor}
          />
        </View>
        {velocityData.length > 0 ? (
          <LineChart
            curved={isSmooth}
            isAnimated
            data={velocityData}
            width={chartAvailableWidth}
            initialSpacing={20}
            endSpacing={20}
            spacing={lineSpacingVelocity}
            color={velocityColor}
            thickness={3}
            dataPointsColor={velocityColor}
            disableScroll
            hideRules={false}
            rulesType="solid"
            rulesColor={colors.border}
            yAxisColor="transparent"
            xAxisColor={colors.border}
            yAxisLabelWidth={30}
            yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
            xAxisLabelTextStyle={{
              color: colors.textSecondary,
              fontSize: 9,
              width: 40,
              textAlign: "center",
            }}
            showReferenceLine1={velocityAvg > 0}
            referenceLine1Position={velocityAvg}
            referenceLine1Config={velocityRefConfig}
            pointerConfig={velocityPointerConfig}
            {...calcYAxis(velocityMax)}
          />
        ) : (
          <Text className="text-[#494454] dark:text-[#94A3B8]">
            No data available
          </Text>
        )}
      </View>

      {/* Genre Breakdown */}
      <View className="items-center bg-white dark:bg-[#1E293B] p-4 border border-[#E2E8F0] dark:border-[#334155] rounded-2xl">
        <Text className="self-start mb-4 font-bold text-[#111c2d] dark:text-[#F8FAFC] text-base">
          Genre Breakdown
        </Text>
        {pieData.length > 0 ? (
          <View className="flex-row items-center w-full">
            <PieChart
              donut
              data={pieData}
              innerRadius={50}
              radius={80}
              centerLabelComponent={() => (
                <View className="justify-center items-center">
                  <Text className="font-bold text-[#111c2d] text-[22px] dark:text-[#F8FAFC]">
                    {rawGenres.length}
                  </Text>
                  <Text className="text-[#494454] text-[10px] dark:text-[#94A3B8]">
                    Genres
                  </Text>
                </View>
              )}
            />
            <View className="flex-1 gap-[7px] ml-5">
              {pieData.map((item: any, index: number) => (
                <View
                  key={index}
                  className="flex-row justify-between items-center"
                >
                  <View className="flex-row flex-1 items-center mr-[6px]">
                    <View
                      className="mr-[7px] rounded-full w-[10px] h-[10px]"
                      style={{ backgroundColor: item.color }}
                    />
                    <Text
                      className="flex-shrink text-[#111c2d] dark:text-[#F8FAFC] text-xs"
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <Text className="font-semibold text-[#494454] text-[11px] dark:text-[#94A3B8]">
                    {item.percentage.toFixed(0)}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <Text className="text-[#494454] dark:text-[#94A3B8]">
            No data available
          </Text>
        )}
      </View>

      {/* Language Breakdown */}
      {languageData.length > 0 && (
        <View className="bg-white dark:bg-[#1E293B] p-4 border border-[#E2E8F0] dark:border-[#334155] rounded-2xl">
          <Text className="mb-4 font-bold text-[#111c2d] dark:text-[#F8FAFC] text-base">
            Language Breakdown
          </Text>
          <View className="gap-3">
            {languageData.map((lang: any, index: number) => (
              <View key={index}>
                <View className="flex-row justify-between mb-[6px]">
                  <Text className="font-medium text-[#111c2d] text-[13px] dark:text-[#F8FAFC]">
                    {lang.name}
                  </Text>
                  <Text className="font-semibold text-[#494454] text-[13px] dark:text-[#94A3B8]">
                    {lang.count} {lang.count === 1 ? "book" : "books"} ·{" "}
                    {lang.percentage.toFixed(0)}%
                  </Text>
                </View>
                <View className="bg-[#E2E8F0] dark:bg-[#334155] rounded-[3px] h-[6px] overflow-hidden">
                  <View
                    className="rounded-[3px] h-full"
                    style={{
                      width: `${Math.min(lang.percentage, 100)}%`,
                      backgroundColor:
                        PRESET_COLORS[index % PRESET_COLORS.length],
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
