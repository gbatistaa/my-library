package com.gabriel.mylibrary.bookClub.clubBookReview;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClubBookReviewRepository extends JpaRepository<ClubBookReviewEntity, UUID> {

  @EntityGraph(attributePaths = { "user" })
  List<ClubBookReviewEntity> findByClubBookId(UUID clubBookId);

  Optional<ClubBookReviewEntity> findByClubBookIdAndUserId(UUID clubBookId, UUID userId);

  boolean existsByClubBookIdAndUserId(UUID clubBookId, UUID userId);
}
