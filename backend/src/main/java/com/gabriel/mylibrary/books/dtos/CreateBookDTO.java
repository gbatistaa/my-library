package com.gabriel.mylibrary.books.dtos;

import com.gabriel.mylibrary.common.enums.BookStatus;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookDTO {

  @NotBlank(message = "Book title is required")
  @Size(max = 100, message = "Book title must not exceed 100 characters")
  private String title;

  @NotBlank(message = "Author name is required")
  @Size(max = 255, message = "Author name must not exceed 255 characters")
  private String author;

  @Min(value = 1, message = "Rating must be at least 1")
  @Max(value = 5, message = "Rating must not exceed 5")
  private Integer rating;

  @NotNull(message = "Number of pages is required")
  @Min(value = 1, message = "Book must have at least 1 page")
  private Integer pages;

  @NotBlank(message = "ISBN is required")
  @Size(min = 10, max = 13, message = "ISBN must be between 10 and 13 characters")
  @Pattern(regexp = "^(97[89])?\\d{9}[\\dX]$", message = "ISBN must be a valid format (10 or 13 digits)")
  private String isbn;

  @NotBlank(message = "Genre is required")
  @Size(max = 100, message = "Genre must not exceed 100 characters")
  private String genre;

  @NotNull(message = "Book status is required")
  private BookStatus status;

  private LocalDate startDate;

  private LocalDate finishDate;

  @Size(max = 1000, message = "Notes must not exceed 1000 characters")
  private String notes;

  private String coverUrl;
}
