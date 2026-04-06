package com.gabriel.mylibrary.user;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.gabriel.mylibrary.user.projections.UserProfileProjection;
import com.gabriel.mylibrary.user.projections.UserSummary;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, UUID> {
  boolean existsByUsername(String username);

  boolean existsByEmail(String email);

  Optional<UserEntity> findByUsername(String username);

  Optional<UserEntity> findByEmail(String email);

  @Query("SELECT u.id AS id, u.name AS name, u.username AS username, " +
      "u.email AS email, u.birthDate AS birthDate, u.createdAt AS createdAt, " +
      "u.profilePicPath AS profilePicPath " +
      "FROM UserEntity u WHERE u.id = :id")
  Optional<UserSummary> findSummaryById(UUID id);

  @Query("SELECT u.id AS id, u.name AS name, u.username AS username, " +
      "u.email AS email, u.birthDate AS birthDate, u.createdAt AS createdAt " +
      "FROM UserEntity u WHERE u.id = :id")
  Optional<UserProfileProjection> findProfileById(UUID id);
}
