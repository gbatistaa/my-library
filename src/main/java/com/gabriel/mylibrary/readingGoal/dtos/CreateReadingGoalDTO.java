package com.gabriel.mylibrary.readingGoal.dtos;

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

  @NotNull(message = "Target pages is required")
  @Min(value = 1, message = "Target pages must be at least 1")
  private Integer targetPages;
}
