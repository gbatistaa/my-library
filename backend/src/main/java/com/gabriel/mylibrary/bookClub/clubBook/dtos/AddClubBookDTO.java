package com.gabriel.mylibrary.bookClub.clubBook.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddClubBookDTO {
  @NotBlank(message = "googleBooksId is required")
  private String googleBooksId;
}
