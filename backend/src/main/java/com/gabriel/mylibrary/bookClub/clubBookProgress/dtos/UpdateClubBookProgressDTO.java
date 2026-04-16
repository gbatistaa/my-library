package com.gabriel.mylibrary.bookClub.clubBookProgress.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateClubBookProgressDTO {
  @NotNull
  @Min(0)
  private Integer currentPage;
}
