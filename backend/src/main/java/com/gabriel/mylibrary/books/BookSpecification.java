package com.gabriel.mylibrary.books;

import com.gabriel.mylibrary.common.enums.BookStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class BookSpecification {

  private BookSpecification() {
  }

  public static Specification<BookEntity> withFilters(
      UUID userId,
      BookStatus status,
      Integer minRating,
      UUID categoryId,
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

      if (categoryId != null) {
        predicates.add(cb.equal(root.get("category").get("id"), categoryId));
      }

      if (author != null && !author.isBlank()) {
        predicates.add(cb.like(cb.lower(root.get("author")), "%" + author.toLowerCase() + "%"));
      }

      if (year != null) {
        LocalDate startOfYear = LocalDate.of(year, 1, 1);
        LocalDate endOfYear = LocalDate.of(year, 12, 31);
        predicates.add(cb.between(root.get("finishDate"), startOfYear, endOfYear));
      }

      return cb.and(predicates.toArray(new Predicate[0]));
    };
  }
}
