package com.gabriel.mylibrary.analytics.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSummaryDTO {
  private int totalPagesRead;
  private long totalActiveMinutes;
  private double avgPagesPerMinute;
}
