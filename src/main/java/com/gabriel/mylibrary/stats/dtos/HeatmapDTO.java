package com.gabriel.mylibrary.stats.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HeatmapDTO {
  private int year;
  private List<DayActivityDTO> days;

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class DayActivityDTO {
    private LocalDate date;
    private int pagesRead;
    private int sessionCount;
  }
}
