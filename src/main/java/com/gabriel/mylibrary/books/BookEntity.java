package com.gabriel.mylibrary.books;

import java.util.ArrayList;
import java.util.List;

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
    @Index(name = "idx_books_saga", columnList = "saga_id")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_books_name_author", columnNames = { "name", "author" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookEntity extends BaseEntity {

  @NotBlank
  @Column(nullable = false, length = 100)
  private String name;

  @NotBlank
  @Column(nullable = false, length = 255)
  private String author;

  @Min(1)
  @Max(5)
  @Column(nullable = false)
  private Integer rating;

  @Min(1)
  @Column(nullable = false)
  private Integer pages;

  @NotBlank
  @Size(min = 10, max = 13)
  @Column(nullable = false, length = 13, unique = true)
  private String isbn;

  @NotBlank
  @Column(nullable = false, length = 100)
  private String genre;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private BookStatus status;

  @Column(name = "cover_url")
  private String coverUrl;

  @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  @Builder.Default
  private List<CategoryEntity> categories = new ArrayList<>();

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "saga_id")
  private SagaEntity saga;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private UserEntity user;
}
