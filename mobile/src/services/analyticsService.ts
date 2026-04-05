import { api } from './api';

export interface AnalyticsSummaryDTO {
  totalPagesRead: number;
  totalActiveMinutes: number;
  avgPagesPerMinute: number;
}

export interface AnalyticsTrendDTO {
  metric: string;
  data: { label: string; value: number }[];
}

export interface AnalyticsDistributionDTO {
  genres: { name: string; percentage: number; count: number }[];
  languages: { name: string; percentage: number; count: number }[];
}

export const getAnalyticsSummary = async (period: string): Promise<AnalyticsSummaryDTO> => {
  const { data } = await api.get(`/analytics/summary?period=${period}`);
  return data;
};

export const getAnalyticsTrends = async (metric: string, period: string): Promise<AnalyticsTrendDTO> => {
  const { data } = await api.get(`/analytics/trends?metric=${metric}&period=${period}`);
  return data;
};

export const getAnalyticsDistribution = async (): Promise<AnalyticsDistributionDTO> => {
  const { data } = await api.get('/analytics/distribution');
  return data;
};

export interface HeatmapDTO {
  year: number;
  days: {
    date: string;
    pagesRead: number;
    sessionCount: number;
  }[];
}

export const getAnalyticsHeatmap = async (year: number): Promise<HeatmapDTO> => {
  const { data } = await api.get(`/analytics/heatmap?year=${year}`);
  return data;
};
