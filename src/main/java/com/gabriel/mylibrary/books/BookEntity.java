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
@Table(name = "books", uniqueConstraints = {
    @UniqueConstraint(name = "books_author", columnNames = { "name", "author" })
})
@Getter
@Setter
@NoArgsConstructor
public class BookEntity extends BaseEntity {

  @Column(nullable = false, length = 100)
  private String name;

  @Column(nullable = false, length = 255)
  private String author;

  @Min(1)
  @Max(5)
  @Column(nullable = false)
  private Integer rating;

  @Min(1)
  @Column(nullable = false)
  private Integer pages;

  @Column(nullable = false, length = 13, unique = true)
  private String isbn;

  @Column(nullable = false, length = 100)
  private String genre;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private BookStatus status;

  @Column(name = "cover_url")
  private String coverUrl;

  @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private List<CategoryEntity> categories = new ArrayList<>();

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "saga_id")
  private SagaEntity saga;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  private UserEntity user;
}
