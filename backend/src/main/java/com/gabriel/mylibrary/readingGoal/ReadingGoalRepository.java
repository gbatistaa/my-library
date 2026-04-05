package com.gabriel.mylibrary.readingGoal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReadingGoalRepository extends JpaRepository<ReadingGoalEntity, UUID> {
  Optional<ReadingGoalEntity> findByUserIdAndYear(UUID userId, Integer year);

  boolean existsByUserIdAndYear(UUID userId, Integer year);

  List<ReadingGoalEntity> findAllByUserId(UUID userId);
}
