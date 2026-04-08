package com.gabriel.mylibrary.email.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailRequestDTO {
  @NotBlank(message = "Recipient email is required")
  @Email(message = "Invalid email format")
  private String to;

  @NotBlank(message = "Subject is required")
  private String subject;
}
