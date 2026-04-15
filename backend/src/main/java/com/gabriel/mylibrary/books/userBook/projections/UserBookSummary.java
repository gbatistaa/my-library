package com.gabriel.mylibrary.books.userBook.projections;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

import com.gabriel.mylibrary.common.enums.BookStatus;

public interface UserBookSummary {

  UUID getId();

  Integer getRating();

  Integer getPagesRead();

  BookStatus getStatus();

  LocalDate getStartDate();

  LocalDate getFinishDate();

  BookRef getBook();

  interface BookRef {
    UUID getId();

    String getTitle();

    String getAuthor();

    Integer getPages();

    String getCoverUrl();

    Set<String> getCategories();
  }
}
