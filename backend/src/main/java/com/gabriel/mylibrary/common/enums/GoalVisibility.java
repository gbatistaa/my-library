package com.gabriel.mylibrary.common.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum GoalVisibility {
  PUBLIC,
  PRIVATE;

  @JsonCreator
  public static GoalVisibility from(String value) throws IllegalArgumentException {
    for (GoalVisibility v : values()) {
      if (v.name().equalsIgnoreCase(value)) {
        return v;
      }
    }
    throw new IllegalArgumentException("Invalid visibility value '" + value + "'. Accepted values are: PUBLIC, PRIVATE.");
  }
}
