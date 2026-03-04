package com.gabriel.mylibrary.auth.tokens;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshTokenEntity, UUID> {
  Optional<RefreshTokenEntity> findByUserId(UUID userId);

  Optional<RefreshTokenEntity> findByToken(String token);

  boolean existsByUserId(UUID userId);
}
