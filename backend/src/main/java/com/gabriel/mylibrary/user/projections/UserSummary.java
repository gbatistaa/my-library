package com.gabriel.mylibrary.user.projections;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public interface UserSummary {
    UUID getId();
    String getName();
    String getUsername();
    String getEmail();
    LocalDate getBirthDate();
    LocalDateTime getCreatedAt();
    String getProfilePicPath();
}
