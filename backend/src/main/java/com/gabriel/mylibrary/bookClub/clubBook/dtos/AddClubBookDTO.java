package com.gabriel.mylibrary.bookClub.clubBook.dtos;

import java.time.LocalDate;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddClubBookDTO {
  @NotBlank(message = "googleBooksId is required")
  private String googleBooksId;

  @NotNull(message = "Deadline is required")
  @Future(message = "Deadline must be in the future")
  private LocalDate deadline;
}
