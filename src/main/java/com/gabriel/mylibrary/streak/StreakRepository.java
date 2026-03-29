package com.gabriel.mylibrary.streak;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StreakRepository extends JpaRepository<StreakEntity, UUID> {
  Optional<StreakEntity> findByUserId(UUID userId);
}
