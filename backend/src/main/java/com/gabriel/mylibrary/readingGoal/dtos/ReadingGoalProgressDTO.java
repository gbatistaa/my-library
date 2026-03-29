package com.gabriel.mylibrary.readingGoal.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReadingGoalProgressDTO {
  private ReadingGoalDTO goal;

  // Raw progress
  private int booksRead;
  private int pagesRead;

  // Pace & projections
  private double dailyPaceRequired;
  private double currentPace;
  private String projectedFinishDate;
  private boolean onTrack;

  // Streak integration
  private int currentStreak;
  private int bestStreak;
  private String streakInsight;

  // Diversity
  private int uniqueAuthors;
  private int uniqueGenres;
  private String topGenre;

  // Micro-victories
  private int dailyPagesGoal;
  private String dailyInsight;
}
