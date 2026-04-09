package com.gabriel.mylibrary.bookClub.bookClubMembers.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

import com.gabriel.mylibrary.bookClub.bookClubMembers.enums.BookClubMemberRole;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookClubMemberDTO {
  private UUID id;
  private UUID bookClubId;
  private UUID userId;
  private BookClubMemberRole role;
  private LocalDateTime joinedAt;
}
