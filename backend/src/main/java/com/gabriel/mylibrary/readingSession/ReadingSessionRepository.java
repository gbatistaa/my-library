package com.gabriel.mylibrary.readingSession;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.gabriel.mylibrary.analytics.dtos.DailySessionAggDTO;
import org.springframework.stereotype.Repository;

@Repository
public interface ReadingSessionRepository extends JpaRepository<ReadingSessionEntity, UUID> {
  List<ReadingSessionEntity> findAllByUserId(UUID userId);

  @EntityGraph(attributePaths = { "userBook", "userBook.book" })
  @Query("SELECT rs FROM ReadingSessionEntity rs WHERE rs.user.id = :userId ORDER BY rs.createdAt DESC")
  org.springframework.data.domain.Page<ReadingSessionEntity> findAllByUserIdOrderByCreatedAtDesc(
      @Param("userId") UUID userId,
      org.springframework.data.domain.Pageable pageable);

  List<ReadingSessionEntity> findAllByUserBookIdAndUserId(UUID userBookId, UUID userId);

  Optional<ReadingSessionEntity> findByIdAndUserId(UUID id, UUID userId);

  @Query("SELECT COALESCE(SUM(rs.pagesRead), 0) FROM ReadingSessionEntity rs WHERE rs.user.id = :userId AND rs.createdAt BETWEEN :start AND :end")
  int sumPagesReadByUserIdAndCreatedAtBetween(@Param("userId") UUID userId,
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end);

  @Query("SELECT COALESCE(SUM(rs.pagesRead), 0) FROM ReadingSessionEntity rs WHERE rs.user.id = :userId")
  int sumAllPagesReadByUserId(@Param("userId") UUID userId);

  @Query("SELECT COALESCE(SUM(rs.durationSeconds), 0) FROM ReadingSessionEntity rs WHERE rs.user.id = :userId")
  long sumAllDurationByUserId(@Param("userId") UUID userId);

  @Query("SELECT COALESCE(SUM(rs.durationSeconds), 0) FROM ReadingSessionEntity rs WHERE rs.user.id = :userId AND rs.createdAt BETWEEN :start AND :end")
  long sumDurationByUserIdAndCreatedAtBetween(@Param("userId") UUID userId,
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end);

  @Query("SELECT COALESCE(AVG(rs.pagesRead), 0) FROM ReadingSessionEntity rs WHERE rs.user.id = :userId")
  double avgPagesPerSessionByUserId(@Param("userId") UUID userId);

  @Query("SELECT COALESCE(AVG(rs.durationSeconds), 0) FROM ReadingSessionEntity rs WHERE rs.user.id = :userId")
  double avgDurationPerSessionByUserId(@Param("userId") UUID userId);

  long countByUserId(UUID userId);

  @Query("SELECT COUNT(DISTINCT CAST(rs.createdAt AS date)) FROM ReadingSessionEntity rs WHERE rs.user.id = :userId AND rs.createdAt BETWEEN :start AND :end")
  long countDistinctReadingDaysByUserIdAndCreatedAtBetween(@Param("userId") UUID userId,
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end);

  @Query("SELECT new com.gabriel.mylibrary.analytics.dtos.DailySessionAggDTO(" +
      "CAST(rs.createdAt AS date), " +
      "SUM(CAST(rs.pagesRead AS long)), " +
      "SUM(rs.durationSeconds), " +
      "COUNT(rs)) " +
      "FROM ReadingSessionEntity rs " +
      "WHERE rs.user.id = :userId AND rs.createdAt BETWEEN :start AND :end " +
      "GROUP BY CAST(rs.createdAt AS date) " +
      "ORDER BY CAST(rs.createdAt AS date)")
  List<DailySessionAggDTO> findDailyAggregationByUserIdAndCreatedAtBetween(
      @Param("userId") UUID userId,
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end);

}
