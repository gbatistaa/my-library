package com.gabriel.mylibrary.books.userBook.dtos;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

import com.gabriel.mylibrary.common.enums.BookStatus;

public record UserBookSummaryDTO(
    UUID id,
    BookRef book,
    BookStatus status,
    Integer rating,
    Integer pagesRead,
    LocalDate startDate,
    LocalDate finishDate) {

  public record BookRef(
      UUID id,
      String title,
      String author,
      Integer pages,
      String coverUrl,
      Set<String> categories) {
  }
}
