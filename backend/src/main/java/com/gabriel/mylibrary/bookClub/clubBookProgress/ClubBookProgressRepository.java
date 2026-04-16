package com.gabriel.mylibrary.bookClub.clubBookProgress;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ClubBookProgressRepository extends JpaRepository<ClubBookProgressEntity, UUID> {
  @EntityGraph(attributePaths = { "clubBook.book" })
  Optional<ClubBookProgressEntity> findByMemberIdAndClubBookId(UUID memberId, UUID clubBookId);

  @EntityGraph(attributePaths = { "clubBook.book" })
  List<ClubBookProgressEntity> findAllByClubBookId(UUID clubBookId);

  boolean existsByMemberIdAndClubBookId(UUID memberId, UUID clubBookId);

  @Query("""
      SELECT p FROM ClubBookProgressEntity p
      WHERE p.status = 'READING'
        AND p.clubBook.deadline IS NOT NULL
        AND p.clubBook.deadline < :today
      """)
  List<ClubBookProgressEntity> findAllOverdue(@Param("today") LocalDate today);
}
