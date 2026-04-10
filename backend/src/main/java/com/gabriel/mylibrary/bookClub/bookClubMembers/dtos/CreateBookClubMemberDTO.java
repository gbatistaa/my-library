package com.gabriel.mylibrary.bookClub.bookClubMembers.dtos;

import java.util.UUID;

import com.gabriel.mylibrary.bookClub.bookClubMembers.enums.BookClubMemberRole;
import com.gabriel.mylibrary.bookClub.bookClubMembers.enums.BookClubMemberStatus;

public record CreateBookClubMemberDTO(
    UUID bookClubId,
    UUID userId,
    BookClubMemberRole role,
    BookClubMemberStatus status) {
}
