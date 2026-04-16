package com.gabriel.mylibrary.bookClub.clubBookProgress.dtos;

import java.time.LocalDate;
import java.util.UUID;

import com.gabriel.mylibrary.bookClub.clubBookProgress.enums.MemberProgressStatus;

public record ClubBookProgressDTO(
    UUID id,
    UUID memberId,
    UUID clubBookId,
    Integer currentPage,
    MemberProgressStatus status,
    LocalDate startedAt,
    LocalDate finishedAt) {
}
