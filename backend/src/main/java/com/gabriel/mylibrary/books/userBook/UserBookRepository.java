package com.gabriel.mylibrary.books.userBook;

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

import com.gabriel.mylibrary.books.userBook.projections.UserBookReadingProjection;
import com.gabriel.mylibrary.books.userBook.projections.UserBookSummary;
import com.gabriel.mylibrary.common.enums.BookStatus;

@Repository
public interface UserBookRepository
    extends JpaRepository<UserBookEntity, UUID>, JpaSpecificationExecutor<UserBookEntity> {

  boolean existsByUserIdAndBookGoogleBooksId(UUID userId, String googleBooksId);

  @EntityGraph(attributePaths = { "book", "book.categories" })
  Optional<UserBookEntity> findByIdAndUserId(UUID id, UUID userId);

  @EntityGraph(attributePaths = { "book", "book.categories" })
  Page<UserBookEntity> findAllByUserId(UUID userId, Pageable pageable);

  @EntityGraph(attributePaths = { "book", "book.categories" })
  Page<UserBookEntity> findAllByUserIdAndBookTitleContainingIgnoreCase(UUID userId, String title, Pageable pageable);

  @Query("SELECT ub FROM UserBookEntity ub WHERE ub.user.id = :userId")
  Page<UserBookSummary> findSummariesByUserId(@Param("userId") UUID userId, Pageable pageable);

  @Query("SELECT ub FROM UserBookEntity ub WHERE ub.user.id = :userId AND LOWER(ub.book.title) LIKE LOWER(CONCAT('%', :title, '%'))")
  Page<UserBookSummary> findSummariesByUserIdAndTitle(@Param("userId") UUID userId, @Param("title") String title,
      Pageable pageable);

  int countByUserIdAndStatusAndFinishDateBetween(UUID userId, BookStatus status, LocalDate startDate,
      LocalDate endDate);

  long countByUserIdAndStatus(UUID userId, BookStatus status);

  long countByUserId(UUID userId);

  List<UserBookEntity> findAllByUserIdAndStatus(UUID userId, BookStatus status);

  @Query("SELECT new com.gabriel.mylibrary.books.userBook.projections.UserBookReadingProjection("
      + "ub.id, ub.book.title, ub.book.pages, ub.createdAt) "
      + "FROM UserBookEntity ub WHERE ub.user.id = :userId AND ub.status = :status")
  List<UserBookReadingProjection> findReadingProjectionsByUserIdAndStatus(@Param("userId") UUID userId,
      @Param("status") BookStatus status);

  @Query("SELECT ub FROM UserBookEntity ub WHERE ub.user.id = :userId AND ub.status = 'COMPLETED'")
  List<UserBookEntity> findAllCompletedByUserId(@Param("userId") UUID userId);

  @Query("SELECT ub FROM UserBookEntity ub WHERE ub.user.id = :userId AND ub.status = 'COMPLETED' AND ub.finishDate BETWEEN :start AND :end")
  List<UserBookEntity> findCompletedByUserIdAndFinishDateBetween(@Param("userId") UUID userId,
      @Param("start") LocalDate start, @Param("end") LocalDate end);

  @Query("SELECT COUNT(DISTINCT c) FROM UserBookEntity ub JOIN ub.book b JOIN b.categories c "
      + "WHERE ub.user.id = :userId AND ub.status = 'COMPLETED'")
  long countDistinctCategoriesByUserId(@Param("userId") UUID userId);

  @Query("SELECT COUNT(DISTINCT c) FROM UserBookEntity ub JOIN ub.book b JOIN b.categories c "
      + "WHERE ub.user.id = :userId AND ub.status = 'COMPLETED' AND ub.finishDate BETWEEN :start AND :end")
  long countDistinctCategoriesByUserIdAndFinishDateBetween(@Param("userId") UUID userId,
      @Param("start") LocalDate start, @Param("end") LocalDate end);

  @Query("SELECT COUNT(DISTINCT ub.book.author) FROM UserBookEntity ub "
      + "WHERE ub.user.id = :userId AND ub.status = 'COMPLETED'")
  long countDistinctAuthorsByUserId(@Param("userId") UUID userId);

  @Query("SELECT COUNT(DISTINCT ub.book.author) FROM UserBookEntity ub "
      + "WHERE ub.user.id = :userId AND ub.status = 'COMPLETED' AND ub.finishDate BETWEEN :start AND :end")
  long countDistinctAuthorsByUserIdAndFinishDateBetween(@Param("userId") UUID userId, @Param("start") LocalDate start,
      @Param("end") LocalDate end);

  @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM SagaEntity s "
      + "WHERE s.user.id = :userId AND NOT EXISTS ("
      + "  SELECT ub FROM UserBookEntity ub "
      + "  WHERE ub.saga = s AND ub.user.id = :userId AND ub.status != 'COMPLETED')")
  boolean hasCompletedSaga(@Param("userId") UUID userId);

  @Query("SELECT c, COUNT(ub) FROM UserBookEntity ub JOIN ub.book b JOIN b.categories c "
      + "WHERE ub.user.id = :userId AND ub.status = 'COMPLETED' "
      + "GROUP BY c ORDER BY COUNT(ub) DESC")
  List<Object[]> countBooksByCategory(@Param("userId") UUID userId);

  @Query("SELECT c FROM UserBookEntity ub JOIN ub.book b JOIN b.categories c "
      + "WHERE ub.user.id = :userId AND ub.status = 'COMPLETED' "
      + "GROUP BY c ORDER BY COUNT(ub) DESC LIMIT 1")
  Optional<String> findTopCategoryByUserId(@Param("userId") UUID userId);

  @Query("SELECT ub.book.author, COUNT(ub) FROM UserBookEntity ub "
      + "WHERE ub.user.id = :userId AND ub.status = 'COMPLETED' "
      + "GROUP BY ub.book.author ORDER BY COUNT(ub) DESC")
  List<Object[]> countBooksByAuthor(@Param("userId") UUID userId);

  @Query("SELECT AVG(ub.rating) FROM UserBookEntity ub WHERE ub.user.id = :userId AND ub.rating IS NOT NULL")
  Double avgRatingByUserId(@Param("userId") UUID userId);

  @Query("SELECT c, AVG(ub.rating) FROM UserBookEntity ub JOIN ub.book b JOIN b.categories c "
      + "WHERE ub.user.id = :userId AND ub.rating IS NOT NULL "
      + "GROUP BY c ORDER BY AVG(ub.rating) DESC")
  List<Object[]> avgRatingByCategory(@Param("userId") UUID userId);
}
