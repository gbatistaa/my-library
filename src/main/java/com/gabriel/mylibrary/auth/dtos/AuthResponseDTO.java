package com.gabriel.mylibrary.auth.dtos;

import java.util.Optional;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {
  private Optional<String> accessToken;
  private Optional<String> refreshToken;
}
