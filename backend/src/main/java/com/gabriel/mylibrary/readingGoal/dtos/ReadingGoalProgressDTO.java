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

  // Diversity (filtered to goal year)
  private int uniqueAuthors;
  private int uniqueGenres;
  private String topGenre;

  // Authors/genres goal tracking
  private Integer targetAuthors;
  private Integer targetGenres;
  private boolean authorsGoalMet;
  private boolean genresGoalMet;

  // Minutes goal tracking
  private long minutesRead;
  private Integer targetMinutes;
  private boolean minutesGoalMet;
  private int dailyMinutesGoal;

  // Micro-victories
  private int dailyPagesGoal;
  private String dailyInsight;
}
