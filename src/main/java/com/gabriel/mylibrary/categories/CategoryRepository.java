package com.gabriel.mylibrary.categories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<CategoryEntity, UUID> {
  boolean existsByNameAndUserId(String name, UUID userId);

  List<CategoryEntity> findAllByUserId(UUID userId);

  Optional<CategoryEntity> findByIdAndUserId(UUID id, UUID userId);
}
