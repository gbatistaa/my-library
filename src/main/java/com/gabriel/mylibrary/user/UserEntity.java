package com.gabriel.mylibrary.user;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.gabriel.mylibrary.auth.tokens.RefreshTokenEntity;
import com.gabriel.mylibrary.common.BaseEntity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;

@Table(name = "users")
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private List<RefreshTokenEntity> refreshTokens = new ArrayList<>();
}
