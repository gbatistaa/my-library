package com.gabriel.mylibrary.books.dtos;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import com.gabriel.mylibrary.common.enums.BookStatus;
import com.gabriel.mylibrary.books.projections.BookSummary;

public record BookSummaryDTO(
    UUID id,
    String title,
    String author,
    String coverUrl,
    Integer rating,
    Integer pages,
    Integer pagesRead,
    BookStatus status,
    Set<CategorySummaryDTO> categories) implements BookSummary {

  @Override
  public UUID getId() {
    return id;
  }

  @Override
  public String getTitle() {
    return title;
  }

  @Override
  public String getAuthor() {
    return author;
  }

  @Override
  public String getCoverUrl() {
    return coverUrl;
  }

  @Override
  public Integer getRating() {
    return rating;
  }

  @Override
  public Integer getPages() {
    return pages;
  }

  @Override
  public Integer getPagesRead() {
    return pagesRead;
  }

  @Override
  public BookStatus getStatus() {
    return status;
  }

  @Override
  public Set<BookSummary.CategorySummary> getCategories() {
    return categories == null ? Set.of()
        : categories.stream()
            .map(c -> (BookSummary.CategorySummary) c)
            .collect(Collectors.toSet());
  }

  public record CategorySummaryDTO(UUID id, String name) implements BookSummary.CategorySummary {
    @Override
    public UUID getId() {
      return id;
    }

    @Override
    public String getName() {
      return name;
    }
  }
}
