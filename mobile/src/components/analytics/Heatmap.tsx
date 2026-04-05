import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useAppTheme } from '@/src/hooks/useAppTheme';

interface HeatmapProps {
  data: { date: string; pagesRead: number; sessionCount: number }[];
}

export function Heatmap({ data }: HeatmapProps) {
  const { colors } = useAppTheme();

  // Helper to parse dates reliably across timezones
  const parseDateLocal = (dateStr: string) => {
    if (dateStr === 'PAD') return new Date(0);
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Sort data by date safely
  const sortedData = [...data].sort((a, b) => parseDateLocal(a.date).getTime() - parseDateLocal(b.date).getTime());

  // Group into weeks
  const weeks: { date: string; pagesRead: number; sessionCount: number }[][] = [];
  let currentWeek: { date: string; pagesRead: number; sessionCount: number }[] = [];

  if (sortedData.length > 0) {
      // pad start of the first week if not sunday
      const firstDate = parseDateLocal(sortedData[0].date);
      let dayOfWeek = firstDate.getDay();
      for(let i = 0; i < dayOfWeek; i++) {
          currentWeek.push({ date: 'PAD', pagesRead: 0, sessionCount: 0 });
      }

      sortedData.forEach(day => {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
      });
      if (currentWeek.length > 0) {
          while (currentWeek.length < 7) {
              currentWeek.push({ date: 'PAD', pagesRead: 0, sessionCount: 0 });
          }
          weeks.push(currentWeek);
      }
  }

  const getColor = (value: number) => {
    if (value === 0) return colors.surface;
    if (value < 10) return colors.primary + '40'; // 25% opacity
    if (value < 30) return colors.primary + '80'; // 50% opacity
    if (value < 60) return colors.primary + 'C0'; // 75% opacity
    return colors.primary; // 100% opacity
  };

  return (
    <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 16 }}>Activity Heatmap</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row' }}>
          {weeks.map((week, colIndex) => (
            <View key={colIndex} style={{ marginRight: 4 }}>
              {week.map((day, rowIndex) => {
                 return (
                    <View
                      key={`${colIndex}-${rowIndex}`}
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 4,
                        backgroundColor: day.date === 'PAD' ? 'transparent' : getColor(day.pagesRead),
                        marginBottom: 4,
                        borderWidth: (day.pagesRead === 0 && day.date !== 'PAD') ? 1 : 0,
                        borderColor: colors.border
                      }}
                    />
                 )
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 12 }}>
         <Text style={{ fontSize: 10, color: colors.textSecondary, marginRight: 8 }}>Less</Text>
         <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginRight: 4 }} />
         <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: colors.primary + '40', marginRight: 4 }} />
         <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: colors.primary + '80', marginRight: 4 }} />
         <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: colors.primary + 'C0', marginRight: 4 }} />
         <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: colors.primary, marginRight: 8 }} />
         <Text style={{ fontSize: 10, color: colors.textSecondary }}>More</Text>
      </View>
    </View>
  );
}
