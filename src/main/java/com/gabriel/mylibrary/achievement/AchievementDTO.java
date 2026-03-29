package com.gabriel.mylibrary.achievement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AchievementDTO {
  private String code;
  private String name;
  private String description;
  private String category;
  private boolean earned;
  private LocalDate earnedAt;
  private Double progress;
  private String progressLabel;
}
