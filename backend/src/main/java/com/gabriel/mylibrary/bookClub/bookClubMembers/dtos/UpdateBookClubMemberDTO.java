package com.gabriel.mylibrary.bookClub.bookClubMembers.dtos;

import com.gabriel.mylibrary.bookClub.bookClubMembers.enums.BookClubMemberRole;
import com.gabriel.mylibrary.bookClub.bookClubMembers.enums.BookClubMemberStatus;

public record UpdateBookClubMemberDTO(
  BookClubMemberRole role,
  BookClubMemberStatus status
) {}
