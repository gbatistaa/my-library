import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useQuery } from '@tanstack/react-query';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import {
  getAnalyticsSummary,
  getAnalyticsTrends,
  getAnalyticsDistribution,
  getAnalyticsHeatmap
} from '@/src/services/analyticsService';
import { AnalyticsCharts } from '@/src/components/analytics/AnalyticsCharts';
import { Heatmap } from '@/src/components/analytics/Heatmap';

const FILTERS = ['WEEK', 'MONTH', 'HALF_YEAR', 'YEAR'];
const FILTER_LABELS: Record<string, string> = {
  WEEK: 'Weekly',
  MONTH: 'Monthly',
  HALF_YEAR: '6 Months',
  YEAR: 'Yearly'
};

export default function AnalyticsScreen() {
  const { colors, mode } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState('MONTH');


  const { data: summary, isLoading: loadingSummary, isError: errSummary } = useQuery({
    queryKey: ['analytics-summary', period],
    queryFn: () => getAnalyticsSummary(period),
  });

  const { data: pagesTrend, isLoading: loadingPages, isError: errPages } = useQuery({
    queryKey: ['analytics-trends', 'PAGES', period],
    queryFn: () => getAnalyticsTrends('PAGES', period),
  });

  const { data: timeTrend, isLoading: loadingTime, isError: errTime } = useQuery({
    queryKey: ['analytics-trends', 'TIME', period],
    queryFn: () => getAnalyticsTrends('TIME', period),
  });

  const { data: velocityTrend, isLoading: loadingVelocity, isError: errVelocity } = useQuery({
    queryKey: ['analytics-trends', 'VELOCITY', period],
    queryFn: () => getAnalyticsTrends('VELOCITY', period),
  });


  const { data: distribution, isLoading: loadingDist, isError: errDist } = useQuery({
    queryKey: ['analytics-distribution'],
    queryFn: () => getAnalyticsDistribution(),
  });

  const { data: heatmapData, isLoading: loadingHeatmap, isError: errHeatmap } = useQuery({
    queryKey: ['analytics-heatmap', new Date().getFullYear()],
    queryFn: () => getAnalyticsHeatmap(new Date().getFullYear()),
  });

  const isLoading = loadingSummary || loadingPages || loadingTime || loadingVelocity || loadingDist || loadingHeatmap;
  const isError = errSummary || errPages || errTime || errVelocity || errDist || errHeatmap;



  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 48,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>Reading Analytics</Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>
            Deep dive into your reading habits.
          </Text>
        </View>

        {/* Filters */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 4,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: colors.border
        }}>
          {FILTERS.map(f => {
            const isActive = period === f;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setPeriod(f)}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  alignItems: 'center',
                  backgroundColor: isActive ? colors.primary : 'transparent',
                  borderRadius: 8,
                }}
              >
                <Text style={{
                  fontSize: 13,
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? '#fff' : colors.textSecondary
                }}>
                  {FILTER_LABELS[f]}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Data Loading, Error, or Charts */}
        <View style={{ gap: 24 }}>
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : isError ? (
            <View style={{ padding: 24, backgroundColor: colors.error + '20', borderRadius: 12, alignItems: 'center' }}>
              <Text style={{ color: colors.error, fontSize: 16, fontWeight: '700' }}>Failed to load analytics data.</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 8, textAlign: 'center' }}>Please check your connection and try again.</Text>
            </View>
          ) : (

            <>
              {summary && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={{ flex: 1, backgroundColor: colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginRight: 8 }}>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>Total Pages</Text>
                    <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>{summary.totalPagesRead}</Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginHorizontal: 4 }}>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>Time (Min)</Text>
                    <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>{summary.totalActiveMinutes}</Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginLeft: 8 }}>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>Pace (p/m)</Text>
                    <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>{summary.avgPagesPerMinute.toFixed(1)}</Text>
                  </View>
                </View>
              )}

              <AnalyticsCharts
                pagesTrend={pagesTrend}
                timeTrend={timeTrend}
                velocityTrend={velocityTrend}
                distribution={distribution}
              />

              {heatmapData && <Heatmap data={heatmapData.days} />}
            </>
          )}
        </View>

      </ScrollView>
    </View>
  );
}
