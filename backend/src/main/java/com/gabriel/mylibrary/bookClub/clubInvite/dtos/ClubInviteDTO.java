package com.gabriel.mylibrary.bookClub.clubInvite.dtos;

import java.time.LocalDate;
import java.util.UUID;

public record ClubInviteDTO(
    UUID id,
    UUID clubId,
    String inviterName,
    String inviteeName,
    String clubName,
    LocalDate expiresAt,
    LocalDate createdAt) {
}
