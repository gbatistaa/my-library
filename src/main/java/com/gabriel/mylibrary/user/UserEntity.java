package com.gabriel.mylibrary.user;

import java.time.LocalDate;

import com.gabriel.mylibrary.common.BaseEntity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;

@Table(name = "user")
@Entity
@Getter
@Setter
@NoArgsConstructor
public class UserEntity extends BaseEntity {
  @Size(max = 30)
  @Column(nullable = false, unique = true)
  private String username;

  @Size(max = 100)
  @Column(nullable = false, unique = true)
  private String email;

  @Size(min = 8, max = 255)
  @Column(nullable = false)
  private String password;

  @Column(name = "birth_date", nullable = false)
  private LocalDate birthDate;
}
