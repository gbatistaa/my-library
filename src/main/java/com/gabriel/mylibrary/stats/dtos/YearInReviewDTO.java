package com.gabriel.mylibrary.stats.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YearInReviewDTO {
  private int year;

  // Impressive numbers
  private int booksRead;
  private int pagesRead;
  private String pagesEquivalent;
  private int readingDays;
  private long totalMinutesRead;

  // Unique highlights
  private String fastestBook;
  private String longestBook;
  private String highestRatedBook;
  private String mostRereadableGenre;

  // Moments
  private LocalDate bestReadingDay;
  private int bestDayPages;
  private int longestStreak;

  // YoY Growth
  private Integer booksVsPreviousYear;
  private String growthInsight;
}
