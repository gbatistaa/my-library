package com.gabriel.mylibrary.auth.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DeviceInfoDTO {

  @NotBlank(message = "Device ID is required")
  @Size(max = 255, message = "Device ID must be at most 255 characters")
  private String deviceId;

  @NotBlank(message = "Device name is required")
  @Size(max = 255, message = "Device name must be at most 255 characters")
  private String deviceName;
}
