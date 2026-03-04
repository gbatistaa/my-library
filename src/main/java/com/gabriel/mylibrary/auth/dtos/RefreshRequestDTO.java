package com.gabriel.mylibrary.auth.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RefreshRequestDTO {
  @NotBlank(message = "Refresh token is required")
  private String refreshToken;
}
