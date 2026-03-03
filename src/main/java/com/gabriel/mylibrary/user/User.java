package com.gabriel.mylibrary.user;

import java.time.LocalDate;

import com.gabriel.mylibrary.common.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Table(name = "user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class User extends BaseEntity {
  @Max(30)
  @Column(nullable = false, unique = true)
  private String username;

  @Max(100)
  @Column(nullable = false, unique = true)
  private String email;

  @Min(8)
  @Column(nullable = false)
  private String password;

  @Column(name = "birth_date", nullable = false)
  private LocalDate birthDate;
}
