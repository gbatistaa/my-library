import React from 'react';
import { View, Text } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-gifted-charts';
import { useAppTheme } from '@/src/hooks/useAppTheme';

interface AnalyticsChartsProps {
  pagesTrend: any;
  timeTrend: any;
  velocityTrend: any;
  distribution: any;
}

export function AnalyticsCharts({ pagesTrend, timeTrend, velocityTrend, distribution }: AnalyticsChartsProps) {
  const { colors } = useAppTheme();

  const pagesData = pagesTrend?.data?.map((d: any) => ({
    value: d.value,
    label: d.label,
    dataPointText: d.value.toString()
  })) || [];

  const timeData = timeTrend?.data?.map((d: any) => ({
    value: d.value,
    label: d.label,
    frontColor: colors.primary
  })) || [];

  const velocityData = velocityTrend?.data?.map((d: any) => ({
    value: d.value,
    label: d.label
  })) || [];

  // Pie chart expects data in a specific format and handles colors
  const genreColors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
  const pieData = distribution?.genres?.map((g: any, index: number) => ({
    value: g.count,
    text: `${g.percentage.toFixed(0)}%`,
    color: genreColors[index % genreColors.length],
    label: g.name
  })) || [];

  return (
    <View style={{ gap: 24 }}>
      {/* Area Chart: Pages Read (Cumulative) */}
      <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 16 }}>Pages Read</Text>
        {pagesData.length > 0 ? (
          <LineChart
            areaChart
            data={pagesData}
            startFillColor={colors.primary}
            startOpacity={0.8}
            endFillColor={colors.primary}
            endOpacity={0.1}
            color={colors.primary}
            thickness={3}
            hideRules
            yAxisColor="transparent"
            xAxisColor={colors.border}
            yAxisTextStyle={{ color: colors.textSecondary }}
            xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
            pointerConfig={{
              pointerStripHeight: 160,
              pointerStripColor: 'lightgray',
              pointerStripWidth: 2,
              pointerColor: 'lightgray',
              radius: 6,
              pointerLabelWidth: 100,
              pointerLabelHeight: 90,
              activatePointersOnLongPress: false,
              autoAdjustPointerLabelPosition: false,
              pointerLabelComponent: (items: any) => {
                return (
                  <View
                    style={{
                      height: 40,
                      width: 80,
                      justifyContent: 'center',
                      marginTop: -30,
                      marginLeft: -40,
                      backgroundColor: colors.surface,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: colors.border,
                      paddingHorizontal: 8
                    }}>
                    <Text style={{color: colors.text, fontSize: 12, fontWeight: 'bold', textAlign: 'center'}}>
                      {items[0].value} pages
                    </Text>
                  </View>
                );
              },
            }}
          />
        ) : <Text style={{ color: colors.textSecondary }}>No data available</Text>}
      </View>

      {/* Bar Chart: Time Investment */}
      <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 16 }}>Time Reading (Minutes)</Text>
        {timeData.length > 0 ? (
          <BarChart
            data={timeData}
            barWidth={22}
            spacing={16}
            roundedTop
            hideRules
            xAxisThickness={1}
            yAxisThickness={0}
            yAxisTextStyle={{ color: colors.textSecondary }}
            xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
            xAxisColor={colors.border}
            noOfSections={4}
          />
        ) : <Text style={{ color: colors.textSecondary }}>No data available</Text>}
      </View>

      {/* Line Chart: Reading Velocity */}
      <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 16 }}>Pace (Pages/Min)</Text>
        {velocityData.length > 0 ? (
          <LineChart
            data={velocityData}
            color={colors.tertiary || '#ec4899'}
            thickness={3}
            dataPointsColor={colors.tertiary || '#ec4899'}
            hideRules
            yAxisColor="transparent"
            xAxisColor={colors.border}
            yAxisTextStyle={{ color: colors.textSecondary }}
            xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
          />
        ) : <Text style={{ color: colors.textSecondary }}>No data available</Text>}
      </View>

      {/* Donut Chart: Genre Distribution */}
      <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 16, alignSelf: 'flex-start' }}>Genre Breakdown</Text>
        {pieData.length > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
            <PieChart
              donut
              data={pieData}
              innerRadius={50}
              radius={80}
              centerLabelComponent={() => {
                return (
                  <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{fontSize: 22, color: colors.text, fontWeight: 'bold'}}>{distribution?.genres?.length || 0}</Text>
                    <Text style={{fontSize: 10, color: colors.textSecondary}}>Genres</Text>
                  </View>
                );
              }}
            />
            <View style={{ marginLeft: 20, flex: 1 }}>
              {pieData.map((item: any, index: number) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: item.color, marginRight: 8 }} />
                  <Text style={{ color: colors.text, fontSize: 12, flexShrink: 1 }} numberOfLines={1}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : <Text style={{ color: colors.textSecondary }}>No data available</Text>}
      </View>
    </View>
  );
}
