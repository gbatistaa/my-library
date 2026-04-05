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
public class AnalyticsDistributionDTO {
  private List<DistributionItem> genres;
  private List<DistributionItem> languages;

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class DistributionItem {
    private String name;
    private double percentage;
    private int count;
  }
}
