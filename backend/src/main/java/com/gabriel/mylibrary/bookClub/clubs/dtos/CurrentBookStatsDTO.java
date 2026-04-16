package com.gabriel.mylibrary.bookClub.clubs.dtos;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CurrentBookStatsDTO(
    UUID clubBookId,
    String bookTitle,
    String bookAuthor,
    Integer totalPages,
    LocalDate startedAt,
    LocalDate deadline,
    Integer totalActiveMembers,
    Integer finishedCount,
    Integer pendingCount,
    Integer averageProgressPercent,
    List<MemberProgressSummaryDTO> memberProgress) {
}
