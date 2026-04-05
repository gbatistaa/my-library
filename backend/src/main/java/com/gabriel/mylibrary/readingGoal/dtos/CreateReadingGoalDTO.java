package com.gabriel.mylibrary.readingGoal.dtos;

import com.gabriel.mylibrary.common.enums.GoalVisibility;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReadingGoalDTO {

  @NotNull(message = "Year is required")
  @Min(value = 2000, message = "Year must be valid")
  private Integer year;

  @NotNull(message = "Target books is required")
  @Min(value = 1, message = "Target books must be at least 1")
  private Integer targetBooks;

  @Min(value = 1, message = "Target pages must be at least 1")
  private Integer targetPages;

  @Min(value = 1, message = "Target authors must be at least 1")
  private Integer targetAuthors;

  @Min(value = 1, message = "Target genres must be at least 1")
  private Integer targetGenres;

  @Min(value = 1, message = "Target minutes must be at least 1")
  private Integer targetMinutes;

  private GoalVisibility visibility;
}
