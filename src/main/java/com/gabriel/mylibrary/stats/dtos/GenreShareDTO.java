package com.gabriel.mylibrary.stats.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GenreShareDTO {
  private String genre;
  private double share;
  private long count;
}
