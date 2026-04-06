package com.gabriel.mylibrary.saga;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.gabriel.mylibrary.common.enums.BookStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SagaRepository extends JpaRepository<SagaEntity, UUID> {
  List<SagaEntity> findAllByUserId(UUID userId);

  Optional<SagaEntity> findByIdAndUserId(UUID id, UUID userId);

  boolean existsByNameAndUserId(String name, UUID userId);

  @Query("SELECT s.id, COUNT(b) FROM SagaEntity s LEFT JOIN s.books b WHERE s.user.id = :userId GROUP BY s.id")
  List<Object[]> countBooksBySagaIdForUser(@Param("userId") UUID userId);

  @Query("SELECT COUNT(b) FROM SagaEntity s JOIN s.books b WHERE s.id = :sagaId")
  long countBooksBySagaId(@Param("sagaId") UUID sagaId);

  @Query("SELECT COUNT(b) FROM SagaEntity s JOIN s.books b WHERE s.id = :sagaId AND b.status = :status")
  long countBooksBySagaIdAndStatus(@Param("sagaId") UUID sagaId, @Param("status") BookStatus status);
}
