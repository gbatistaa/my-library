package com.gabriel.mylibrary.bookClub.bookClubMembers.dtos;

import java.util.UUID;

import com.gabriel.mylibrary.bookClub.bookClubMembers.enums.BookClubMemberRole;
import com.gabriel.mylibrary.bookClub.bookClubMembers.enums.BookClubMemberStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookClubMemberDTO {
  private UUID bookClubId;
  private UUID userId;
  private BookClubMemberRole role;
  private BookClubMemberStatus status = BookClubMemberStatus.ACTIVE;
}
