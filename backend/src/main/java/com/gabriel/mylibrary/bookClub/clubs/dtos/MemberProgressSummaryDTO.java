package com.gabriel.mylibrary.bookClub.clubs.dtos;

import java.util.UUID;

import com.gabriel.mylibrary.bookClub.clubBookProgress.enums.MemberProgressStatus;

public record MemberProgressSummaryDTO(
    UUID memberId,
    Integer currentPage,
    Integer progressPercent,
    MemberProgressStatus status) {
}
