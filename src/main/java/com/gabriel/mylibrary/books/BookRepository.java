package com.gabriel.mylibrary.books;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends JpaRepository<BookEntity, UUID> {
  boolean existsByIsbn(String isbn);

  @EntityGraph(attributePaths = "categories")
  List<BookEntity> findAllByUserId(UUID userId);

}
