package com.gabriel.mylibrary.bookClub.clubBookProgress.dtos;

import java.time.LocalDate;
import java.util.UUID;

public record ClubBookProgressDTO(
    UUID id,
    UUID memberId,
    UUID clubBookId,
    Integer currentPage,
    LocalDate startedAt,
    LocalDate finishedAt) {
}
