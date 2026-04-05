package com.gabriel.mylibrary.analytics.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsTrendDTO {
  private String metric; // "PAGES", "TIME", "VELOCITY"
  private List<DataPoint> data;

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class DataPoint {
    private String label; // "Mon", "Oct 12", etc.
    private double value;
  }
}
