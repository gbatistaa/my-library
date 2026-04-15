package com.gabriel.mylibrary.books;

import java.util.HashSet;
import java.util.Set;

import com.gabriel.mylibrary.common.BaseEntity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "books", indexes = {
    @Index(name = "idx_books_title", columnList = "title"),
    @Index(name = "idx_books_author", columnList = "author")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_books_google_books_id", columnNames = "google_books_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookEntity extends BaseEntity {

  @NotBlank
  @Size(max = 32)
  @Column(name = "google_books_id", nullable = false, updatable = false, length = 32)
  private String googleBooksId;

  @NotBlank
  @Size(max = 255)
  @Column(nullable = false, length = 255)
  private String title;

  @NotBlank
  @Size(max = 255)
  @Column(nullable = false, length = 255)
  private String author;

  @Min(1)
  @Column(nullable = false)
  private Integer pages;

  @Size(min = 10, max = 13)
  @Column(length = 13)
  private String isbn;

  @Size(max = 512)
  @Column(name = "cover_url", length = 512)
  private String coverUrl;

  @Size(max = 2000)
  @Column(length = 2000)
  private String description;

  @Size(max = 16)
  @Column(name = "published_date", length = 16)
  private String publishedDate;

  @Size(max = 128)
  @Column(length = 128)
  private String publisher;

  @Size(max = 16)
  @Column(length = 16)
  private String language;

  @ElementCollection(fetch = FetchType.LAZY)
  @CollectionTable(name = "book_categories", joinColumns = @JoinColumn(name = "book_id", foreignKey = @ForeignKey(name = "fk_book_categories_book")), indexes = @Index(name = "idx_book_categories_category", columnList = "category"))
  @Column(name = "category", nullable = false, length = 80)
  @Builder.Default
  private Set<String> categories = new HashSet<>();
}
