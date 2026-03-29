package com.gabriel.mylibrary.stats.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VelocityDTO {
  // Trend (last 4 weeks vs previous 4 weeks)
  private double currentWeeklyPagesAvg;
  private double previousWeeklyPagesAvg;
  private double velocityTrend;

  // Active book projections
  private List<BookProjectionDTO> activeBookProjections;

  // Weekly history (last 12 weeks)
  private List<WeeklyPagesDTO> weeklyHistory;

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class BookProjectionDTO {
    private String bookTitle;
    private int pagesRemaining;
    private String projectedFinishDate;
  }

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class WeeklyPagesDTO {
    private String weekLabel;
    private int pagesRead;
  }
}
