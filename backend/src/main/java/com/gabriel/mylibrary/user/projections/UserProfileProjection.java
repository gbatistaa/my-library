package com.gabriel.mylibrary.user.projections;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * JPA projection for the /auth/me endpoint.
 * Selects only the required columns — no lazy collections loaded.
 */
public interface UserProfileProjection {
  UUID getId();

  String getName();

  String getUsername();

  String getEmail();

  LocalDate getBirthDate();

  LocalDateTime getCreatedAt();

  Long getTotalExperience();

  Integer getLevel();
}
