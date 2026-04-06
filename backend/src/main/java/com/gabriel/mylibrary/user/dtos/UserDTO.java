package com.gabriel.mylibrary.user.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
  private UUID id;
  private String name;
  private String username;
  private String email;
  private LocalDate birthDate;
  private LocalDateTime createdAt;
  private String profilePicPath;
  private Long totalExperience;
  private Integer level;
  private Long currentXp;
}
