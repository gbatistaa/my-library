import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useAppTheme } from "@/src/hooks/useAppTheme";

interface HeatmapDay {
  date: string;
  pagesRead: number;
  sessionCount: number;
}

interface HeatmapProps {
  data: HeatmapDay[];
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAY_LABELS: (string | null)[] = [
  null,
  "Mon",
  null,
  "Wed",
  null,
  "Fri",
  null,
];

const CELL_SIZE = 13;
const CELL_GAP = 3;
const CELL_STRIDE = CELL_SIZE + CELL_GAP;

export function Heatmap({ data }: HeatmapProps) {
  const { colors } = useAppTheme();

  const parseDateLocal = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const sortedData = [...data].sort(
    (a, b) =>
      parseDateLocal(a.date).getTime() - parseDateLocal(b.date).getTime(),
  );

  const weeks: HeatmapDay[][] = [];
  let currentWeek: HeatmapDay[] = [];

  if (sortedData.length > 0) {
    const firstDate = parseDateLocal(sortedData[0].date);
    const startDow = firstDate.getDay();
    for (let i = 0; i < startDow; i++) {
      currentWeek.push({ date: "PAD", pagesRead: 0, sessionCount: 0 });
    }
    for (const day of sortedData) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: "PAD", pagesRead: 0, sessionCount: 0 });
      }
      weeks.push(currentWeek);
    }
  }

  const getMonthLabel = (
    week: HeatmapDay[],
    colIndex: number,
  ): string | null => {
    for (const day of week) {
      if (day.date !== "PAD") {
        const d = parseDateLocal(day.date);
        if (d.getDate() === 1) return MONTH_NAMES[d.getMonth()];
      }
    }
    if (colIndex === 0) {
      for (const day of week) {
        if (day.date !== "PAD")
          return MONTH_NAMES[parseDateLocal(day.date).getMonth()];
      }
    }
    return null;
  };

  // Cell colors are data-driven — must stay as inline style
  const getColor = (pages: number) => {
    if (pages === 0) return colors.surface;
    if (pages < 10) return colors.primary + "40";
    if (pages < 30) return colors.primary + "80";
    if (pages < 60) return colors.primary + "C0";
    return colors.primary;
  };

  const activeDays = data.filter((d) => d.pagesRead > 0).length;
  const year = data.find((d) => d.date !== "PAD")
    ? parseDateLocal(data.find((d) => d.date !== "PAD")!.date).getFullYear()
    : new Date().getFullYear();

  const DAY_LABEL_COL_WIDTH = 28;
  const MONTH_ROW_HEIGHT = 16;

  return (
    <View className="bg-white dark:bg-[#1E293B] p-4 border border-[#E2E8F0] dark:border-[#334155] rounded-2xl">
      {/* Header */}
      <View className="mb-3">
        <Text className="font-bold text-[#111c2d] dark:text-[#F8FAFC] text-base">
          Activity Heatmap
        </Text>
        <Text className="mt-0.5 text-[#494454] dark:text-[#94A3B8] text-xs">
          {activeDays} {activeDays === 1 ? "day" : "days"} with reading activity
          in {year}
        </Text>
      </View>

      {/* Grid */}
      <View className="flex-row">
        {/* Fixed day-of-week labels */}
        <View
          style={{
            width: DAY_LABEL_COL_WIDTH,
            marginTop: MONTH_ROW_HEIGHT + CELL_GAP,
          }}
        >
          {DAY_LABELS.map((label, i) => (
            <View
              key={i}
              style={{
                height: CELL_SIZE,
                marginBottom: CELL_GAP,
                justifyContent: "center",
              }}
            >
              {label && (
                <Text className="font-medium text-[#494454] text-[9px] dark:text-[#94A3B8]">
                  {label}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Scrollable month labels + week columns */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* Month labels */}
            <View
              className="flex-row"
              style={{ height: MONTH_ROW_HEIGHT, marginBottom: CELL_GAP }}
            >
              {weeks.map((week, colIndex) => {
                const label = getMonthLabel(week, colIndex);
                return (
                  <View
                    key={colIndex}
                    style={{ width: CELL_STRIDE, justifyContent: "flex-end" }}
                  >
                    {label && (
                      <Text className="font-semibold text-[#494454] text-[9px] dark:text-[#94A3B8]">
                        {label}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Week columns */}
            <View className="flex-row">
              {weeks.map((week, colIndex) => (
                <View key={colIndex} style={{ marginRight: CELL_GAP }}>
                  {week.map((day, rowIndex) => (
                    <View
                      key={`${colIndex}-${rowIndex}`}
                      style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        borderRadius: 3,
                        marginBottom: CELL_GAP,
                        backgroundColor:
                          day.date === "PAD"
                            ? "transparent"
                            : getColor(day.pagesRead),
                        borderWidth:
                          day.date !== "PAD" && day.pagesRead === 0 ? 1 : 0,
                        borderColor: colors.border,
                      }}
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Intensity legend */}
      <View className="flex-row justify-end items-center mt-[10px]">
        <Text className="mr-[6px] text-[#494454] text-[9px] dark:text-[#94A3B8]">
          Less
        </Text>
        {[
          { bg: colors.surface, bordered: true },
          { bg: colors.primary + "40" },
          { bg: colors.primary + "80" },
          { bg: colors.primary + "C0" },
          { bg: colors.primary },
        ].map((s, i) => (
          <View
            key={i}
            className={`w-[10px] h-[10px] rounded-[2px] ${i < 4 ? "mr-[3px]" : "mr-[6px]"}`}
            style={{
              backgroundColor: s.bg,
              borderWidth: s.bordered ? 1 : 0,
              borderColor: colors.border,
            }}
          />
        ))}
        <Text className="text-[#494454] text-[9px] dark:text-[#94A3B8]">
          More
        </Text>
      </View>
    </View>
  );
}
