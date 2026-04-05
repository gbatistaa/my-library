package com.gabriel.mylibrary.readingGoal.dtos;

import com.gabriel.mylibrary.common.enums.GoalVisibility;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReadingGoalDTO {
  private String id;
  private Integer year;
  private Integer targetBooks;
  private Integer targetPages;
  private Integer targetAuthors;
  private Integer targetGenres;
  private Integer targetMinutes;
  private GoalVisibility visibility;
}
