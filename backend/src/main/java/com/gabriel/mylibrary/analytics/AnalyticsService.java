package com.gabriel.mylibrary.analytics;

import com.gabriel.mylibrary.analytics.dtos.AnalyticsSummaryDTO;
import com.gabriel.mylibrary.analytics.dtos.AnalyticsTrendDTO;
import com.gabriel.mylibrary.analytics.dtos.AnalyticsDistributionDTO;
import com.gabriel.mylibrary.analytics.dtos.DailySessionAggDTO;
import com.gabriel.mylibrary.stats.dtos.HeatmapDTO;
import com.gabriel.mylibrary.books.BookRepository;
import com.gabriel.mylibrary.readingSession.ReadingSessionRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

  private final ReadingSessionRepository readingSessionRepository;
  private final BookRepository bookRepository;

  public AnalyticsSummaryDTO getSummary(UUID userId, String period) {
    LocalDateTime startDate = calculateStartDate(period);
    LocalDateTime endDate = LocalDateTime.now();

    int totalPagesRead = readingSessionRepository.sumPagesReadByUserIdAndCreatedAtBetween(userId, startDate, endDate);
    long totalActiveSeconds = readingSessionRepository.sumDurationByUserIdAndCreatedAtBetween(userId, startDate,
        endDate);
    long totalActiveMinutes = totalActiveSeconds / 60;

    double avgPagesPerMinute = 0.0;
    if (totalActiveMinutes > 0) {
      avgPagesPerMinute = (double) totalPagesRead / totalActiveMinutes;
    }

    return AnalyticsSummaryDTO.builder()
        .totalPagesRead(totalPagesRead)
        .totalActiveMinutes(totalActiveMinutes)
        .avgPagesPerMinute(avgPagesPerMinute)
        .build();
  }

  public AnalyticsTrendDTO getTrends(UUID userId, String metric, String period) {
    LocalDateTime startDate = calculateStartDate(period);
    LocalDateTime endDate = LocalDateTime.now();

    List<DailySessionAggDTO> dailyAggs = readingSessionRepository
        .findDailyAggregationByUserIdAndCreatedAtBetween(userId, startDate, endDate);

    List<AnalyticsTrendDTO.DataPoint> dataPoints = new ArrayList<>();
    double cumulativeValue = 0.0;

    if (period.toUpperCase().endsWith("WEEK") || "MONTH".equalsIgnoreCase(period) || "CURRENT_MONTH".equalsIgnoreCase(period)) {
      boolean isWeekPeriod = period.toUpperCase().contains("WEEK");
      DateTimeFormatter formatter = isWeekPeriod
          ? DateTimeFormatter.ofPattern("EEE", java.util.Locale.ENGLISH)
          : DateTimeFormatter.ofPattern("d");
      Map<LocalDate, DailySessionAggDTO> aggMap = dailyAggs.stream()
          .collect(Collectors.toMap(DailySessionAggDTO::getSessionDate, agg -> agg));

      LocalDate date = startDate.toLocalDate();
      while (!date.isAfter(endDate.toLocalDate())) {
        DailySessionAggDTO agg = aggMap.getOrDefault(date, new DailySessionAggDTO(date, 0L, 0L, 0L));
        String label = date.format(formatter);

        double value = 0.0;
        if ("PAGES".equalsIgnoreCase(metric)) {
          cumulativeValue += agg.getTotalPages();
          value = cumulativeValue;
        } else if ("TIME".equalsIgnoreCase(metric)) {
          value = agg.getTotalDuration() / 60.0;
        } else if ("VELOCITY".equalsIgnoreCase(metric)) {
          if (agg.getTotalDuration() > 0) {
            value = (double) agg.getTotalPages() / (agg.getTotalDuration() / 60.0);
          }
        }
        dataPoints.add(new AnalyticsTrendDTO.DataPoint(label, value));
        date = date.plusDays(1);
      }
    } else if ("HALF_YEAR".equalsIgnoreCase(period)) {
      DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM");
      // Group by week
      Map<String, DailySessionAggDTO> weekAggMap = new LinkedHashMap<>();
      LocalDate date = startDate.toLocalDate().with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.SUNDAY));
      while (!date.isAfter(endDate.toLocalDate())) {
        String label = date.format(formatter);
        weekAggMap.put(label, new DailySessionAggDTO(date, 0L, 0L, 0L));
        date = date.plusWeeks(1);
      }

      for (DailySessionAggDTO agg : dailyAggs) {
        String label = agg.getSessionDate().with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.SUNDAY)).format(formatter);
        if (weekAggMap.containsKey(label)) {
          DailySessionAggDTO weekAgg = weekAggMap.get(label);
          weekAgg.setTotalPages(weekAgg.getTotalPages() + agg.getTotalPages());
          weekAgg.setTotalDuration(weekAgg.getTotalDuration() + agg.getTotalDuration());
          weekAgg.setSessionCount(weekAgg.getSessionCount() + agg.getSessionCount());
        }
      }

      for (Map.Entry<String, DailySessionAggDTO> entry : weekAggMap.entrySet()) {
        String label = entry.getKey();
        DailySessionAggDTO agg = entry.getValue();

        double value = 0.0;
        if ("PAGES".equalsIgnoreCase(metric)) {
          cumulativeValue += agg.getTotalPages();
          value = cumulativeValue;
        } else if ("TIME".equalsIgnoreCase(metric)) {
          value = agg.getTotalDuration() / 60.0;
        } else if ("VELOCITY".equalsIgnoreCase(metric)) {
          if (agg.getTotalDuration() > 0) {
            value = (double) agg.getTotalPages() / (agg.getTotalDuration() / 60.0);
          }
        }
        dataPoints.add(new AnalyticsTrendDTO.DataPoint(label, value));
      }
    } else {
      DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM");
      // Group by month
      Map<String, DailySessionAggDTO> monthAggMap = new LinkedHashMap<>();
      LocalDate date = startDate.toLocalDate().withDayOfMonth(1);
      while (!date.isAfter(endDate.toLocalDate())) {
        String label = date.format(formatter);
        monthAggMap.put(label, new DailySessionAggDTO(date, 0L, 0L, 0L));
        date = date.plusMonths(1);
      }

      for (DailySessionAggDTO agg : dailyAggs) {
        String label = agg.getSessionDate().withDayOfMonth(1).format(formatter);
        if (monthAggMap.containsKey(label)) {
          DailySessionAggDTO monthAgg = monthAggMap.get(label);
          monthAgg.setTotalPages(monthAgg.getTotalPages() + agg.getTotalPages());
          monthAgg.setTotalDuration(monthAgg.getTotalDuration() + agg.getTotalDuration());
          monthAgg.setSessionCount(monthAgg.getSessionCount() + agg.getSessionCount());
        }
      }

      for (Map.Entry<String, DailySessionAggDTO> entry : monthAggMap.entrySet()) {
        String label = entry.getKey();
        DailySessionAggDTO agg = entry.getValue();

        double value = 0.0;
        if ("PAGES".equalsIgnoreCase(metric)) {
          cumulativeValue += agg.getTotalPages();
          value = cumulativeValue;
        } else if ("TIME".equalsIgnoreCase(metric)) {
          value = agg.getTotalDuration() / 60.0;
        } else if ("VELOCITY".equalsIgnoreCase(metric)) {
          if (agg.getTotalDuration() > 0) {
            value = (double) agg.getTotalPages() / (agg.getTotalDuration() / 60.0);
          }
        }
        dataPoints.add(new AnalyticsTrendDTO.DataPoint(label, value));
      }
    }

    return AnalyticsTrendDTO.builder()
        .metric(metric)
        .data(dataPoints)
        .build();
  }

  public AnalyticsDistributionDTO getDistribution(UUID userId) {
    List<Object[]> genreData = bookRepository.countBooksByCategory(userId);

    long totalBooks = bookRepository.countByUserId(userId);

    List<AnalyticsDistributionDTO.DistributionItem> genres = new ArrayList<>();

    for (Object[] row : genreData) {
      String name = (String) row[0];
      long count = (Long) row[1];
      double percentage = totalBooks > 0 ? ((double) count / totalBooks) * 100 : 0;
      genres.add(new AnalyticsDistributionDTO.DistributionItem(name, percentage, (int) count));
    }

    return AnalyticsDistributionDTO.builder()
        .genres(genres)
        .languages(new ArrayList<>())
        .build();
  }

  public HeatmapDTO getHeatmap(UUID userId, int year) {
    LocalDateTime startOfYear = LocalDate.of(year, 1, 1).atStartOfDay();
    LocalDateTime endOfYear = LocalDate.of(year, 12, 31).atTime(23, 59, 59);

    List<DailySessionAggDTO> dailyAggs = readingSessionRepository
        .findDailyAggregationByUserIdAndCreatedAtBetween(userId, startOfYear, endOfYear);

    Map<LocalDate, HeatmapDTO.DayActivityDTO> dayMap = new LinkedHashMap<>();
    LocalDate date = LocalDate.of(year, 1, 1);
    LocalDate end = LocalDate.of(year, 12, 31);
    while (!date.isAfter(end) && !date.isAfter(LocalDate.now())) {
      dayMap.put(date, new HeatmapDTO.DayActivityDTO(date, 0, 0));
      date = date.plusDays(1);
    }

    for (DailySessionAggDTO agg : dailyAggs) {
      LocalDate sessionDate = agg.getSessionDate();
      HeatmapDTO.DayActivityDTO day = dayMap.get(sessionDate);
      if (day != null) {
        day.setPagesRead(day.getPagesRead() + (int) agg.getTotalPages());
        day.setSessionCount(day.getSessionCount() + (int) agg.getSessionCount());
      }
    }

    return HeatmapDTO.builder()
        .year(year)
        .days(new ArrayList<>(dayMap.values()))
        .build();
  }

  private LocalDateTime calculateStartDate(String period) {
    LocalDateTime now = LocalDateTime.now();
    switch (period != null ? period.toUpperCase() : "MONTH") {
      case "WEEK":
        return now.minusDays(7);
      case "MONTH":
        return now.minusDays(30);
      case "HALF_YEAR":
        return now.minusMonths(6);
      case "YEAR":
        return now.minusYears(1);
      case "CURRENT_WEEK":
        return now.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY)).withHour(0)
            .withMinute(0).withSecond(0);
      case "CURRENT_MONTH":
        return now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
      case "CURRENT_YEAR":
        return now.withDayOfYear(1).withHour(0).withMinute(0).withSecond(0);
      default:
        return now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0); // Default to current month
    }
  }
}
