package com.gabriel.mylibrary.readingSession;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReadingSessionRepository extends JpaRepository<ReadingSessionEntity, UUID> {
  List<ReadingSessionEntity> findAllByUserId(UUID userId);

  List<ReadingSessionEntity> findAllByBookIdAndUserId(UUID bookId, UUID userId);

  Optional<ReadingSessionEntity> findByIdAndUserId(UUID id, UUID userId);

  @Query("SELECT COALESCE(SUM(rs.pagesRead), 0) FROM ReadingSessionEntity rs WHERE rs.user.id = :userId AND rs.createdAt BETWEEN :start AND :end")
  int sumPagesReadByUserIdAndCreatedAtBetween(@Param("userId") UUID userId,
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end);

  @Query("SELECT COALESCE(SUM(rs.pagesRead), 0) FROM ReadingSessionEntity rs WHERE rs.user.id = :userId")
  int sumAllPagesReadByUserId(@Param("userId") UUID userId);

  @Query("SELECT COALESCE(SUM(rs.durationMinutes), 0) FROM ReadingSessionEntity rs WHERE rs.user.id = :userId")
  long sumAllDurationByUserId(@Param("userId") UUID userId);

  @Query("SELECT COALESCE(AVG(rs.pagesRead), 0) FROM ReadingSessionEntity rs WHERE rs.user.id = :userId")
  double avgPagesPerSessionByUserId(@Param("userId") UUID userId);

  @Query("SELECT COALESCE(AVG(rs.durationMinutes), 0) FROM ReadingSessionEntity rs WHERE rs.user.id = :userId")
  double avgDurationPerSessionByUserId(@Param("userId") UUID userId);

  long countByUserId(UUID userId);
}
