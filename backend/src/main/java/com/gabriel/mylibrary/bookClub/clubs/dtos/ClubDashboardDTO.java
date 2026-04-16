package com.gabriel.mylibrary.bookClub.clubs.dtos;

import java.util.UUID;

public record ClubDashboardDTO(
    UUID clubId,
    String clubName,
    Integer totalBooks,
    Integer finishedBooks,
    CurrentBookStatsDTO currentBook) {
}
