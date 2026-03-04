package com.gabriel.mylibrary.auth.dtos;

import java.time.LocalDate;

import com.gabriel.mylibrary.user.dtos.CreateUserDTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class RegisterDTO extends DeviceInfoDTO {

  @NotBlank(message = "The username cannot be empty")
  @Size(min = 3, max = 100, message = "The username must be between 3 and 100 characters")
  private String username;

  @Email(message = "The user email must be a valid email")
  @NotBlank(message = "Email is required")
  private String email;

  @Size(min = 8, max = 64, message = "The password must be between 8 and 64 characters")
  @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,64}$", message = "The password must contain at least one uppercase letter, one lowercase letter, one number and one special character")
  private String password;

  @NotNull(message = "Birth date is required")
  private LocalDate birthDate;

  public CreateUserDTO toCreateUserDTO() {
    return new CreateUserDTO(username, email, password, birthDate);
  }
}
