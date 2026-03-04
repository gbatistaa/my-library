package com.gabriel.mylibrary.auth.tokens.dtos;

import java.time.Instant;
import java.util.UUID;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateRefreshTokenDTO {
  @NotNull(message = "User ID is required")
  private UUID userId;

  @NotNull(message = "Token is required")
  @Size(min = 1, max = 512, message = "Token must be between 1 and 512 characters")
  private String token;

  @NotNull(message = "Expiration date is required")
  @Future(message = "Expiration date must be in the future")
  private Instant expirationDate;
}
