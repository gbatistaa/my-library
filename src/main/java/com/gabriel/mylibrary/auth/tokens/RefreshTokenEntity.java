package com.gabriel.mylibrary.auth.tokens;

import java.time.Instant;
import java.util.UUID;

import com.gabriel.mylibrary.common.BaseEntity;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Column(name = "expiration_date", nullable = false)
  private Instant expirationDate;

  @Column(name = "device_id", nullable = false)
  private String deviceId;

  @Column(name = "device_name", nullable = false)
  private String deviceName;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false, insertable = false, updatable = false)
  private UserEntity user;
}
