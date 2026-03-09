package com.gabriel.mylibrary.common.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum BookStatus {
  TO_READ,
  READING,
  COMPLETED,
  DROPPED;

  @JsonCreator
  public static BookStatus from(String value) {

    for (BookStatus status : values()) {
      if (status.name().equalsIgnoreCase(value)) {
        return status;
      }
    }

    throw new IllegalArgumentException(
        "Invalid book status. Allowed values: TO_READ, READING, COMPLETED, DROPPED");
  }
}
