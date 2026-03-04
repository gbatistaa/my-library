package com.gabriel.mylibrary.auth.tokens;

import java.time.Instant;
import java.util.UUID;

import com.gabriel.mylibrary.common.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "refresh_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RefreshTokenEntity extends BaseEntity {
  @Column(nullable = false, unique = true, length = 512)
  private String token;

  @Column(name = "user_id", nullable = false, unique = true)
  private UUID userId;

  @Column(name = "expiration_date", nullable = false)
  private Instant expirationDate;
}
