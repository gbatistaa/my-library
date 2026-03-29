package com.gabriel.mylibrary.streak;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StreakDTO {
  private int currentStreak;
  private int bestStreak;
  private int totalReadingDays;
  private LocalDate lastReadingDate;
  private String insight;
}
