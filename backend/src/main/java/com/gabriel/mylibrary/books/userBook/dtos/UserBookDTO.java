package com.gabriel.mylibrary.books.userBook.dtos;

import java.time.LocalDate;
import java.util.UUID;

import com.gabriel.mylibrary.books.dtos.BookDTO;
import com.gabriel.mylibrary.common.enums.BookStatus;

public record UserBookDTO(
    UUID id,
    BookDTO book,
    BookStatus status,
    Integer rating,
    Integer pagesRead,
    LocalDate startDate,
    LocalDate finishDate,
    String notes,
    UUID sagaId) {
}
