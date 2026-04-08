package com.gabriel.mylibrary.streak;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface StreakRepository extends JpaRepository<StreakEntity, UUID> {
  Optional<StreakEntity> findByUserId(UUID userId);

  @Modifying
  @Query("UPDATE StreakEntity s SET s.currentStreak = 0 WHERE s.lastReadingDate < :yesterday")
  void resetStreaksOlderThan(@Param("yesterday") LocalDate yesterday);
}
