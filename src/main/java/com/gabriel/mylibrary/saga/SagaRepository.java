package com.gabriel.mylibrary.saga;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SagaRepository extends JpaRepository<SagaEntity, UUID> {
  List<SagaEntity> findAllByUserId(UUID userId);

  Optional<SagaEntity> findByIdAndUserId(UUID id, UUID userId);

  boolean existsByNameAndUserId(String name, UUID userId);
}
