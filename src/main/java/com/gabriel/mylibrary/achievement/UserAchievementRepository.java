package com.gabriel.mylibrary.achievement;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserAchievementRepository extends JpaRepository<UserAchievementEntity, UUID> {
  List<UserAchievementEntity> findAllByUserId(UUID userId);

  boolean existsByUserIdAndCode(UUID userId, AchievementDefinition code);

  List<UserAchievementEntity> findTop3ByUserIdOrderByEarnedAtDesc(UUID userId);
}
