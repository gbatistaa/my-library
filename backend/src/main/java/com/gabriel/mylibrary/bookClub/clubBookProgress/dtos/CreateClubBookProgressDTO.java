package com.gabriel.mylibrary.bookClub.clubBookProgress.dtos;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateClubBookProgressDTO {
  @NotNull
  @Min(1)
  @Max(5)
  private Integer rating;

  @NotNull
  private Integer currentPage = 0;
}
