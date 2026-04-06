package com.gabriel.mylibrary.books;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import com.gabriel.mylibrary.categories.CategoryEntity;
import com.gabriel.mylibrary.common.BaseEntity;
import com.gabriel.mylibrary.common.enums.BookStatus;
import com.gabriel.mylibrary.saga.SagaEntity;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "books", indexes = {
    @Index(name = "idx_books_user", columnList = "user_id"),
    @Index(name = "idx_books_saga", columnList = "saga_id"),
    @Index(name = "idx_books_user_title", columnList = "user_id, title")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_books_user_title_author", columnNames = { "user_id", "title", "author" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookEntity extends BaseEntity {

  @NotBlank
  @Column(nullable = false, length = 100)
  private String title;

  @NotBlank
  @Column(nullable = false, length = 255)
  private String author;

  @Min(1)
  @Max(5)
  @Column(nullable = true)
  private Integer rating;

  @Min(1)
  @Column(nullable = false)
  private Integer pages;

  @Column(name = "pages_read", columnDefinition = "integer default 0")
  private Integer pagesRead;

  @NotBlank
  @Size(min = 10, max = 13)
  @Column(nullable = false, length = 13)
  private String isbn;

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(name = "books_categories", joinColumns = @JoinColumn(name = "book_id"), inverseJoinColumns = @JoinColumn(name = "category_id"))
  @Builder.Default
  private Set<CategoryEntity> categories = new HashSet<>();

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private BookStatus status;

  @Column(name = "cover_url")
  private String coverUrl;

  @Column(name = "start_date", nullable = true)
  private LocalDate startDate;

  @Column(name = "finish_date", nullable = true)
  private LocalDate finishDate;

  @Column(nullable = true, length = 1000)
  private String notes;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "saga_id")
  private SagaEntity saga;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private UserEntity user;
}
