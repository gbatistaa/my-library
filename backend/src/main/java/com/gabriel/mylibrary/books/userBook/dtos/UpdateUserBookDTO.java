package com.gabriel.mylibrary.books.userBook.dtos;

import java.time.LocalDate;
import java.util.UUID;

import com.gabriel.mylibrary.common.enums.BookStatus;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserBookDTO {

  private BookStatus status;

  @Min(1)
  @Max(5)
  private Integer rating;

  @Min(0)
  private Integer pagesRead;

  private LocalDate startDate;

  private LocalDate finishDate;

  @Size(max = 1000)
  private String notes;

  private UUID sagaId;
}
