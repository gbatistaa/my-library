package com.gabriel.mylibrary.bookClub.clubs.dtos;

import java.util.UUID;

import com.gabriel.mylibrary.bookClub.clubs.enums.BookClubStatus;

import lombok.Data;

@Data
public class BookClubDTO {
  private UUID id;
  private String name;
  private String description;
  private Integer maxMembers;
  private UUID adminId;
  private BookClubStatus status;
  private Integer activeMembersCount;
  private Integer totalBooksCount;
}
