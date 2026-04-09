package com.gabriel.mylibrary.bookClub.clubs.dtos;

import java.util.UUID;

import com.gabriel.mylibrary.bookClub.clubs.enums.BookClubStatus;

public record BookClubDTO(
    UUID id,
    String name,
    String description,
    Integer maxMembers,
    Integer currentMembers,
    UUID adminId,
    BookClubStatus status) {
}
