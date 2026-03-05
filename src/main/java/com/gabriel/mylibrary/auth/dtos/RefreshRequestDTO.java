package com.gabriel.mylibrary.auth.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RefreshRequestDTO {
  @jakarta.validation.constraints.NotNull(message = "User ID is required")
  private java.util.UUID userId;

  @jakarta.validation.constraints.NotBlank(message = "Device ID is required")
  private String deviceId;
}
