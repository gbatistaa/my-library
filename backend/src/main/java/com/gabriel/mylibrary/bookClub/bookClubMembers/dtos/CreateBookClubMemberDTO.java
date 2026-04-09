package com.gabriel.mylibrary.bookClub.bookClubMembers.dtos;

import java.util.UUID;

public record CreateBookClubMemberDTO(
    UUID bookClubId,
    UUID userId,
    String role
) {}
