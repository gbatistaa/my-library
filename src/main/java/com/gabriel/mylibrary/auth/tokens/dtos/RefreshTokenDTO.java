package com.gabriel.mylibrary.auth.tokens.dtos;

import java.time.Instant;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RefreshTokenDTO {
  private UUID id;
  private String token;
  private UUID userId;
  private String deviceId;
  private String deviceName;
  private Instant expirationDate;
}
