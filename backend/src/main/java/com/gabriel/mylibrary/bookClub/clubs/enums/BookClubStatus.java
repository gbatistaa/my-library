package com.gabriel.mylibrary.bookClub.clubs.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum BookClubStatus {
  ACTIVE,
  INACTIVE,
  ARCHIVED;

  @JsonCreator
  public static BookClubStatus fromValue(String value) {
    for (BookClubStatus status : BookClubStatus.values()) {
      if (status.name().equalsIgnoreCase(value)) {
        return status;
      }
    }
    throw new IllegalArgumentException("Invalid status. Choose between: ACTIVE, INACTIVE or ARCHIVED.");
  }
}
