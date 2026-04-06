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
  "#6b38d4",
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
    <View className="mt-0.5 mb-5">
      <Text className="font-bold text-violet-600 dark:text-violet-400 text-xs uppercase tracking-wider">
        {title}
      </Text>
      <Text className="mt-0.5 text-slate-500 dark:text-slate-400 text-[11px]">
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
  return (
    <View className="flex-row gap-1.5 mt-2">
      {PRESET_COLORS.map((c) => (
        <TouchableOpacity
          key={c}
          activeOpacity={0.7}
          onPress={() => onSelectColor(c)}
          className={`w-4 h-4 rounded-full border-2 ${selectedColor === c ? 'border-slate-400 dark:border-slate-100' : 'border-transparent'}`}
          style={{ backgroundColor: c }}
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
  const { mode } = useAppTheme();
  const { width: screenWidth } = useWindowDimensions();
  // Adjusted width to prevent clipping
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

  const makeRefLineConfig = useCallback(
    (label: string) => ({
      thickness: 1,
      color: mode === 'dark' ? 'rgba(148, 163, 184, 0.3)' : 'rgba(100, 116, 139, 0.2)',
      type: "dashed",
      dashWidth: 4,
      dashGap: 4,
      labelText: label,
      labelTextStyle: {
        color: mode === 'dark' ? '#94A3B8' : '#64748B',
        fontSize: 9,
        fontWeight: "700" as const,
      },
    }),
    [mode],
  );

  const pagesRefConfig = useMemo(
    () => makeRefLineConfig(`${formatNum(pagesAvg)} avg`),
    [makeRefLineConfig, formatNum, pagesAvg],
  );
  const timeRefConfig = useMemo(
    () => makeRefLineConfig(`${formatNum(timeAvg)}m avg`),
    [makeRefLineConfig, formatNum, timeAvg],
  );
  const velocityRefConfig = useMemo(
    () => makeRefLineConfig(`${formatNum(velocityAvg)} avg`),
    [makeRefLineConfig, formatNum, velocityAvg],
  );

  const pointerConfigBase = useMemo(() => ({
    pointerStripHeight: 140,
    pointerStripColor: mode === 'dark' ? 'rgba(148, 163, 184, 0.5)' : 'rgba(100, 116, 139, 0.3)',
    pointerStripWidth: 1.5,
    pointerColor: mode === 'dark' ? '#F8FAFC' : '#0F172A',
    radius: 5,
    pointerLabelWidth: 80,
    pointerLabelHeight: 36,
    activatePointersOnLongPress: true,
    autoAdjustPointerLabelPosition: true,
  }), [mode]);

  const pagesPointerConfig = useMemo(
    () => ({
      ...pointerConfigBase,
      pointerLabelComponent: (items: any) => (
        <View className="justify-center items-center bg-slate-900 dark:bg-slate-50 px-2 rounded-lg shadow-xl border border-slate-700/50 dark:border-slate-200">
          <Text className="font-bold text-white dark:text-slate-900 text-[11px]">
            {formatNum(items[0].value)} pages
          </Text>
        </View>
      ),
    }),
    [pointerConfigBase, formatNum],
  );

  const timePointerConfig = useMemo(
    () => ({
      ...pointerConfigBase,
      pointerLabelComponent: (items: any) => (
        <View className="justify-center items-center bg-slate-900 dark:bg-slate-50 px-2 rounded-lg shadow-xl">
          <Text className="font-bold text-white dark:text-slate-900 text-[11px]">
            {formatNum(items[0].value)} min
          </Text>
        </View>
      ),
    }),
    [pointerConfigBase, formatNum],
  );

  const velocityPointerConfig = useMemo(
    () => ({
      ...pointerConfigBase,
      pointerLabelComponent: (items: any) => (
        <View className="justify-center items-center bg-slate-900 dark:bg-slate-50 px-2 rounded-lg shadow-xl">
          <Text className="font-bold text-white dark:text-slate-900 text-[11px]">
            {formatNum(items[0].value)} p/m
          </Text>
        </View>
      ),
    }),
    [pointerConfigBase, formatNum],
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
      {/* Curve Toggle */}
      <View className="flex-row justify-between items-center bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm">
        <View className="flex-row items-center gap-3">
          <View className="bg-slate-100 dark:bg-slate-700 w-8 h-8 rounded-lg items-center justify-center">
            <Text className="text-lg">📈</Text>
          </View>
          <Text className="font-bold text-slate-800 dark:text-slate-100 text-[14px]">
            Smooth Curves
          </Text>
        </View>
        <Switch
          value={isSmooth}
          onValueChange={setIsSmooth}
          trackColor={{ false: '#CBD5E1', true: '#7c4dff' }}
          thumbColor={mode === 'dark' ? '#F8FAFC' : '#FFFFFF'}
        />
      </View>

      {/* Pages Read Chart */}
      <View className="bg-white dark:bg-slate-800 p-5 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="font-extrabold text-slate-900 dark:text-slate-50 text-base">
              Pages Read
            </Text>
            <ChartSubtitle
              title={chartSubtitle}
              text={`Avg ${formatNum(pagesAvg)} · Peak ${formatNum(pagesMax)}`}
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
            initialSpacing={10}
            endSpacing={10}
            spacing={lineSpacingPages}
            startFillColor={pagesColor}
            startOpacity={0.4}
            endFillColor={pagesColor}
            endOpacity={0.05}
            color={pagesColor}
            thickness={3}
            hideDataPoints
            disableScroll
            hideRules={false}
            rulesType="solid"
            rulesColor={mode === 'dark' ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)'}
            yAxisColor="transparent"
            xAxisColor={mode === 'dark' ? '#334155' : '#E2E8F0'}
            yAxisLabelWidth={30}
            yAxisTextStyle={{ color: '#94A3B8', fontSize: 10, fontWeight: '600' }}
            xAxisLabelTextStyle={{
              color: '#94A3B8',
              fontSize: 9,
              width: 40,
              textAlign: "center",
              fontWeight: '600'
            }}
            showReferenceLine1={pagesAvg > 0}
            referenceLine1Position={pagesAvg}
            referenceLine1Config={pagesRefConfig}
            pointerConfig={pagesPointerConfig}
            {...calcYAxis(pagesMax)}
          />
        ) : (
          <View className="h-[160px] items-center justify-center">
            <Text className="text-slate-400 dark:text-slate-500 font-medium">No data available</Text>
          </View>
        )}
      </View>

      {/* Time Reading Chart */}
      <View className="bg-white dark:bg-slate-800 p-5 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="font-extrabold text-slate-900 dark:text-slate-50 text-base">
              Time Reading
            </Text>
            <ChartSubtitle
              title={chartSubtitle}
              text={`Avg ${formatNum(timeAvg)}m · Peak ${formatNum(timeMax)}m`}
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
            initialSpacing={10}
            endSpacing={10}
            barWidth={barWidth}
            spacing={barSpacing}
            roundedTop
            disableScroll
            hideRules={false}
            rulesType="solid"
            rulesColor={mode === 'dark' ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)'}
            xAxisThickness={1}
            yAxisThickness={0}
            yAxisLabelWidth={30}
            yAxisTextStyle={{ color: '#94A3B8', fontSize: 10, fontWeight: '600' }}
            xAxisLabelTextStyle={{
              color: '#94A3B8',
              fontSize: 9,
              width: 40,
              textAlign: "center",
              fontWeight: '600'
            }}
            xAxisColor={mode === 'dark' ? '#334155' : '#E2E8F0'}
            showReferenceLine1={timeAvg > 0}
            referenceLine1Position={timeAvg}
            referenceLine1Config={timeRefConfig}
            pointerConfig={timePointerConfig}
            {...calcYAxis(timeMax)}
          />
        ) : (
          <View className="h-[160px] items-center justify-center">
            <Text className="text-slate-400 dark:text-slate-500 font-medium">No data available</Text>
          </View>
        )}
      </View>

      {/* Pace Chart */}
      <View className="bg-white dark:bg-slate-800 p-5 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="font-extrabold text-slate-900 dark:text-slate-50 text-base">
              Reading Pace
            </Text>
            <ChartSubtitle
              title={chartSubtitle}
              text={`Avg ${formatNum(velocityAvg)} p/m · Peak ${formatNum(velocityMax)} p/m`}
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
            areaChart
            data={velocityData}
            width={chartAvailableWidth}
            initialSpacing={10}
            endSpacing={10}
            spacing={lineSpacingVelocity}
            startFillColor={velocityColor}
            startOpacity={0.4}
            endFillColor={velocityColor}
            endOpacity={0.05}
            color={velocityColor}
            thickness={3}
            hideDataPoints
            disableScroll
            hideRules={false}
            rulesType="solid"
            rulesColor={mode === 'dark' ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)'}
            yAxisColor="transparent"
            xAxisColor={mode === 'dark' ? '#334155' : '#E2E8F0'}
            yAxisLabelWidth={30}
            yAxisTextStyle={{ color: '#94A3B8', fontSize: 10, fontWeight: '600' }}
            xAxisLabelTextStyle={{
              color: '#94A3B8',
              fontSize: 9,
              width: 40,
              textAlign: "center",
              fontWeight: '600'
            }}
            showReferenceLine1={velocityAvg > 0}
            referenceLine1Position={velocityAvg}
            referenceLine1Config={velocityRefConfig}
            pointerConfig={velocityPointerConfig}
            {...calcYAxis(velocityMax)}
          />
        ) : (
          <View className="h-[160px] items-center justify-center">
            <Text className="text-slate-400 dark:text-slate-500 font-medium">No data available</Text>
          </View>
        )}
      </View>

      {/* Genre Breakdown */}
      <View className="bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700/50 rounded-3xl shadow-sm">
        <Text className="mb-6 font-extrabold text-slate-900 dark:text-slate-50 text-lg">
          Genre Distribution
        </Text>
        {pieData.length > 0 ? (
          <View className="flex-row items-center justify-around">
            <PieChart
              donut
              data={pieData}
              innerRadius={55}
              radius={75}
              centerLabelComponent={() => (
                <View className="justify-center items-center">
                  <Text className="font-black text-slate-900 dark:text-slate-50 text-2xl">
                    {rawGenres.length}
                  </Text>
                  <Text className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                    Types
                  </Text>
                </View>
              )}
            />
            <View className="gap-2.5 min-w-[120px]">
              {pieData.map((item: any, index: number) => (
                <View
                  key={index}
                  className="flex-row justify-between items-center"
                >
                  <View className="flex-row items-center flex-1 mr-3">
                    <View
                      className="mr-2 rounded-full w-2 h-2"
                      style={{ backgroundColor: item.color }}
                    />
                    <Text
                      className="flex-shrink text-slate-700 dark:text-slate-300 text-xs font-medium"
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <Text className="font-bold text-slate-500 dark:text-slate-400 text-[10px]">
                    {item.percentage.toFixed(0)}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View className="h-[150px] items-center justify-center">
            <Text className="text-slate-400 dark:text-slate-500 font-medium">No data available</Text>
          </View>
        )}
      </View>

      {/* Language Breakdown */}
      {languageData.length > 0 && (
        <View className="bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700/50 rounded-3xl shadow-sm">
          <Text className="mb-6 font-extrabold text-slate-900 dark:text-slate-50 text-lg">
            Language Spread
          </Text>
          <View className="gap-4">
            {languageData.map((lang: any, index: number) => (
              <View key={index}>
                <View className="flex-row justify-between mb-1.5 px-0.5">
                  <Text className="font-bold text-slate-800 dark:text-slate-100 text-[13px]">
                    {lang.name}
                  </Text>
                  <Text className="font-bold text-slate-500 dark:text-slate-400 text-[11px]">
                    {lang.count} {lang.count === 1 ? "Book" : "Books"} · {lang.percentage.toFixed(0)}%
                  </Text>
                </View>
                <View className="bg-slate-100 dark:bg-slate-700/50 rounded-full h-2 overflow-hidden shadow-inner">
                  <View
                    className="rounded-full h-full"
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
