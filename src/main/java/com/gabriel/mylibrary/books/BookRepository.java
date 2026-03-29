package com.gabriel.mylibrary.books;

import com.gabriel.mylibrary.common.enums.BookStatus;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends JpaRepository<BookEntity, UUID> {
  boolean existsByIsbnAndUserId(String isbn, UUID userId);

  Optional<BookEntity> findByIdAndUserId(UUID id, UUID userId);

  @EntityGraph(attributePaths = { "categories" })
  Page<BookEntity> findAllByUserId(UUID userId, Pageable pageable);

  @EntityGraph(attributePaths = { "categories" })
  Page<BookEntity> findAllByUserIdAndTitleContainingIgnoreCase(UUID userId, String title, Pageable pageable);

  int countByUserIdAndStatusAndFinishDateBetween(UUID userId, BookStatus status, LocalDate startDate,
      LocalDate endDate);
}
