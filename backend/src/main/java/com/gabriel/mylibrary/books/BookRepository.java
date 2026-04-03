package com.gabriel.mylibrary.books;

import com.gabriel.mylibrary.common.enums.BookStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends JpaRepository<BookEntity, UUID>, JpaSpecificationExecutor<BookEntity> {
  boolean existsByIsbnAndUserId(String isbn, UUID userId);

  @EntityGraph(attributePaths = { "categories" })
  Optional<BookEntity> findByIdAndUserId(UUID id, UUID userId);

  @EntityGraph(attributePaths = { "categories" })
  Page<BookEntity> findAllByUserId(UUID userId, Pageable pageable);

  @EntityGraph(attributePaths = { "categories" })
  Page<BookEntity> findAllByUserIdAndTitleContainingIgnoreCase(UUID userId, String title, Pageable pageable);

  int countByUserIdAndStatusAndFinishDateBetween(UUID userId, BookStatus status, LocalDate startDate,
      LocalDate endDate);

  // Achievement & Stats queries
  long countByUserIdAndStatus(UUID userId, BookStatus status);

  List<BookEntity> findAllByUserIdAndStatus(UUID userId, BookStatus status);

  @Query("SELECT b FROM BookEntity b WHERE b.user.id = :userId AND b.status = 'COMPLETED'")
  List<BookEntity> findAllCompletedByUserId(@Param("userId") UUID userId);

  @Query("SELECT COUNT(DISTINCT c) FROM BookEntity b JOIN b.categories c WHERE b.user.id = :userId AND b.status = 'COMPLETED'")
  long countDistinctCategoriesByUserId(@Param("userId") UUID userId);

  @Query("SELECT COUNT(DISTINCT b.author) FROM BookEntity b WHERE b.user.id = :userId AND b.status = 'COMPLETED'")
  long countDistinctAuthorsByUserId(@Param("userId") UUID userId);

  @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM SagaEntity s WHERE s.user.id = :userId AND NOT EXISTS (SELECT b FROM BookEntity b WHERE b.saga = s AND b.status != 'COMPLETED')")
  boolean hasCompletedSaga(@Param("userId") UUID userId);

  @Query("SELECT b FROM BookEntity b WHERE b.user.id = :userId AND b.status = 'COMPLETED' AND b.finishDate BETWEEN :start AND :end")
  List<BookEntity> findCompletedByUserIdAndFinishDateBetween(@Param("userId") UUID userId,
      @Param("start") LocalDate start, @Param("end") LocalDate end);

  // Stats / Analytics queries
  @Query("SELECT c.name, COUNT(b) FROM BookEntity b JOIN b.categories c WHERE b.user.id = :userId AND b.status = 'COMPLETED' GROUP BY c.name ORDER BY COUNT(b) DESC")
  List<Object[]> countBooksByCategory(@Param("userId") UUID userId);

  @Query("SELECT b.author, COUNT(b) FROM BookEntity b WHERE b.user.id = :userId AND b.status = 'COMPLETED' GROUP BY b.author ORDER BY COUNT(b) DESC")
  List<Object[]> countBooksByAuthor(@Param("userId") UUID userId);

  @Query("SELECT AVG(b.rating) FROM BookEntity b WHERE b.user.id = :userId AND b.rating IS NOT NULL")
  Double avgRatingByUserId(@Param("userId") UUID userId);

  @Query("SELECT c.name, AVG(b.rating) FROM BookEntity b JOIN b.categories c WHERE b.user.id = :userId AND b.rating IS NOT NULL GROUP BY c.name ORDER BY AVG(b.rating) DESC")
  List<Object[]> avgRatingByCategory(@Param("userId") UUID userId);

  long countByUserId(UUID userId);
}
