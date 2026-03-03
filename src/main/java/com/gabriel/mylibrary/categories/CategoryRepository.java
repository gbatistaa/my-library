package com.gabriel.mylibrary.categories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<CategoryEntity, UUID> {
  boolean existsByName(String name);
}
