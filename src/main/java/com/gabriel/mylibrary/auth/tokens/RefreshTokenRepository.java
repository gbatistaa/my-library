package com.gabriel.mylibrary.auth.tokens;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshTokenEntity, UUID> {
  Optional<RefreshTokenEntity> findByToken(String token);

  Optional<RefreshTokenEntity> findByUserIdAndDeviceId(UUID userId, String deviceId);

  void deleteByUserId(UUID userId);

  void deleteByToken(String token);

  boolean existsByUserId(UUID userId);
}
