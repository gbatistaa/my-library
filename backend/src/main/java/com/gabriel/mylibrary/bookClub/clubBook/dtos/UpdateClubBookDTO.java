package com.gabriel.mylibrary.bookClub.clubBook.dtos;

import java.time.LocalDate;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class UpdateClubBookDTO {
  @Min(0)
  private Integer orderIndex;

  private LocalDate startedAt;

  private LocalDate finishedAt;

  @Min(0)
  private Integer currentPage;
}
