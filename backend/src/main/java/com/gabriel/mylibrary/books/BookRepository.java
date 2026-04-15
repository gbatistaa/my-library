package com.gabriel.mylibrary.books;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends JpaRepository<BookEntity, UUID> {

  Optional<BookEntity> findByGoogleBooksId(String googleBooksId);

  boolean existsByGoogleBooksId(String googleBooksId);

  Page<BookEntity> findByTitleContainingIgnoreCase(String title, Pageable pageable);
}
