package com.gabriel.mylibrary.readingGoal.dtos;

import com.gabriel.mylibrary.common.enums.GoalVisibility;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReadingGoalDTO {

  @Min(value = 1, message = "Target books must be at least 1")
  private Integer targetBooks;

  @Min(value = 1, message = "Target pages must be at least 1")
  private Integer targetPages;

  @Min(value = 1, message = "Target authors must be at least 1")
  private Integer targetAuthors;

  @Min(value = 1, message = "Target genres must be at least 1")
  private Integer targetGenres;

  private GoalVisibility visibility;
}
