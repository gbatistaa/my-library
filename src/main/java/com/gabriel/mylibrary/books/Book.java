package com.gabriel.mylibrary.books;

import com.gabriel.mylibrary.common.BaseEntity;
import com.gabriel.mylibrary.common.enums.BookStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "books", uniqueConstraints = {
    @UniqueConstraint(name = "books_author", columnNames = { "name", "author" })
})
@NoArgsConstructor
public class Book extends BaseEntity {

  @Column(name = "name", nullable = false, length = 100)
  private String name;

  @Column(name = "author", nullable = false, length = 255)
  private String author;

  @Min(1)
  @Max(5)
  @Column(name = "rating", nullable = false)
  private Integer rating;

  @Min(1)
  @Column(name = "pages", nullable = false)
  private Integer pages;

  @Column(name = "isbn", nullable = false, length = 13)
  private String isbn;

  @Column(name = "genre", nullable = false, length = 100)
  private String genre;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false)
  private BookStatus status;
}
