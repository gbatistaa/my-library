package com.gabriel.mylibrary.user.dtos;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserDTO {
  @NotBlank(message = "The name cannot be empty")
  @Size(min = 3, max = 100, message = "The name must be between 3 and 100 characters")
  private String name;

  @NotBlank(message = "The username cannot be empty")
  @Size(min = 3, max = 100, message = "The username must be between 3 and 100 characters")
  private String username;

  @Email(message = "The user email must be a valid email")
  private String email;

  @Size(min = 8, max = 64, message = "The password must be between 8 and 64 characters")
  @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,64}$", message = "The password must contain at least one uppercase letter, one lowercase letter, one number and one special character")
  private String password;

  @NotNull(message = "Birth date is required")
  private LocalDate birthDate;
}
