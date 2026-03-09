package com.gabriel.mylibrary.readingSession;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReadingSessionRepository extends JpaRepository<ReadingSessionEntity, UUID> {
  List<ReadingSessionEntity> findAllByUserId(UUID userId);

  List<ReadingSessionEntity> findAllByBookIdAndUserId(UUID bookId, UUID userId);

  Optional<ReadingSessionEntity> findByIdAndUserId(UUID id, UUID userId);
}
