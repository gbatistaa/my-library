package com.gabriel.mylibrary.books;

import java.util.ArrayList;
import java.util.List;

import com.gabriel.mylibrary.categories.CategoryEntity;
import com.gabriel.mylibrary.common.BaseEntity;
import com.gabriel.mylibrary.common.enums.BookStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "books", uniqueConstraints = {
    @UniqueConstraint(name = "books_author", columnNames = { "name", "author" })
})
@Getter
@Setter
@NoArgsConstructor
public class BookEntity extends BaseEntity {

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

  @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private List<CategoryEntity> categories = new ArrayList<>();
}
