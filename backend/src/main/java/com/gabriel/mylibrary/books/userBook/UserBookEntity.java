package com.gabriel.mylibrary.books.userBook;

import java.time.LocalDate;

import com.gabriel.mylibrary.books.BookEntity;
import com.gabriel.mylibrary.common.BaseEntity;
import com.gabriel.mylibrary.common.enums.BookStatus;
import com.gabriel.mylibrary.saga.SagaEntity;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_books", indexes = {
    @Index(name = "idx_user_books_user", columnList = "user_id"),
    @Index(name = "idx_user_books_book", columnList = "book_id"),
    @Index(name = "idx_user_books_user_status", columnList = "user_id, status"),
    @Index(name = "idx_user_books_user_finish", columnList = "user_id, finish_date"),
    @Index(name = "idx_user_books_saga", columnList = "saga_id")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_user_books_user_book", columnNames = { "user_id", "book_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserBookEntity extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false, updatable = false, foreignKey = @ForeignKey(name = "fk_user_books_user"))
  private UserEntity user;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "book_id", nullable = false, updatable = false, foreignKey = @ForeignKey(name = "fk_user_books_book"))
  private BookEntity book;

  @NotNull
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 16)
  private BookStatus status;

  @Min(1)
  @Max(5)
  @Column
  private Integer rating;

  @Min(0)
  @Column(name = "pages_read", nullable = false, columnDefinition = "integer default 0")
  @Builder.Default
  private Integer pagesRead = 0;

  @Column(name = "start_date")
  private LocalDate startDate;

  @Column(name = "finish_date")
  private LocalDate finishDate;

  @Size(max = 1000)
  @Column(length = 1000)
  private String notes;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "saga_id", foreignKey = @ForeignKey(name = "fk_user_books_saga"))
  private SagaEntity saga;
}
