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

  private int booksRead;
  private int pagesRead;

  // Pace metrics
  private String bookPaceStatus; // AHEAD, ON_TRACK, BEHIND
  private String pagePaceStatus; // AHEAD, ON_TRACK, BEHIND

  // Projections
  private int projectedBooks;
  private int projectedPages;

  // Micro-victories
  private int dailyPagesTarget;
  private double dailyBooksTarget;

  // Gamification Insight
  private String dailyInsight;
}
