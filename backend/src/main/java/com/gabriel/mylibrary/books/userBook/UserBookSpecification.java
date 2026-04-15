package com.gabriel.mylibrary.books.userBook;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;

import com.gabriel.mylibrary.common.enums.BookStatus;

import com.gabriel.mylibrary.books.BookEntity;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

public final class UserBookSpecification {

  private UserBookSpecification() {
  }

  public static Specification<UserBookEntity> withFilters(
      UUID userId,
      BookStatus status,
      Integer minRating,
      String category,
      String author,
      Integer year) {

    return (root, query, cb) -> {
      List<Predicate> predicates = new ArrayList<>();
      predicates.add(cb.equal(root.get("user").get("id"), userId));

      if (status != null) {
        predicates.add(cb.equal(root.get("status"), status));
      }

      if (minRating != null) {
        predicates.add(cb.greaterThanOrEqualTo(root.get("rating"), minRating));
      }

      if (category != null && !category.isBlank()) {
        Join<UserBookEntity, BookEntity> bookJoin = root.join("book", JoinType.INNER);
        Join<BookEntity, String> categoriesJoin = bookJoin.join("categories", JoinType.INNER);
        predicates.add(cb.equal(categoriesJoin, category.trim().toLowerCase(Locale.ROOT)));
        query.distinct(true);
      }

      if (author != null && !author.isBlank()) {
        predicates.add(cb.like(
            cb.lower(root.get("book").get("author")),
            "%" + author.toLowerCase(Locale.ROOT) + "%"));
      }

      if (year != null) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        predicates.add(cb.between(root.get("finishDate"), start, end));
      }

      return cb.and(predicates.toArray(new Predicate[0]));
    };
  }
}
