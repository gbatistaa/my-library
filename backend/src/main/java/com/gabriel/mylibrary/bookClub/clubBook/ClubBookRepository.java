package com.gabriel.mylibrary.bookClub.clubBook;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ClubBookRepository extends JpaRepository<ClubBookEntity, UUID> {

  @EntityGraph(attributePaths = { "book" })
  List<ClubBookEntity> findByClubIdOrderByOrderIndexAsc(UUID clubId);

  boolean existsByClubIdAndBookId(UUID clubId, UUID bookId);

  @EntityGraph(attributePaths = { "book" })
  Optional<ClubBookEntity> findByIdAndClubId(UUID id, UUID clubId);

  @Query("SELECT COALESCE(MAX(cb.orderIndex), -1) FROM ClubBookEntity cb WHERE cb.club.id = :clubId")
  int findMaxOrderIndexByClubId(@Param("clubId") UUID clubId);

  @Modifying
  @Query("UPDATE ClubBookEntity cb SET cb.isCurrent = false WHERE cb.club.id = :clubId AND cb.isCurrent = true")
  void clearCurrentForClub(@Param("clubId") UUID clubId);
}
