package com.gabriel.mylibrary.readingGoal.dtos;

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
}
