package com.gabriel.mylibrary.bookClub.clubBook.dtos;

import java.time.LocalDate;
import java.util.UUID;

import com.gabriel.mylibrary.books.dtos.BookDTO;

public record ClubBookDTO(
    UUID id,
    UUID clubId,
    BookDTO book,
    Integer orderIndex,
    Boolean isCurrent,
    LocalDate startedAt,
    LocalDate finishedAt,
    Integer currentPage) {
}
