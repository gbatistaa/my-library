package com.gabriel.mylibrary.books;

import com.gabriel.mylibrary.common.enums.BookStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

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
      String genre,
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

      if (genre != null && !genre.isBlank()) {
        predicates.add(cb.like(cb.lower(root.get("genre")), "%" + genre.toLowerCase() + "%"));
      }

      if (author != null && !author.isBlank()) {
        predicates.add(cb.like(cb.lower(root.get("author")), "%" + author.toLowerCase() + "%"));
      }

      if (year != null) {
        predicates.add(cb.equal(cb.function("YEAR", Integer.class, root.get("finishDate")), year));
      }

      return cb.and(predicates.toArray(new Predicate[0]));
    };
  }
}
