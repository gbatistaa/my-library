package com.gabriel.mylibrary.books.dtos;

import com.gabriel.mylibrary.common.enums.BookStatus;
import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookDTO {
  private String id;
  private String title;
  private String author;
  private Integer rating;
  private Integer pages;
  private Integer pagesRead;
  private String isbn;
  private List<BookCategoryDTO> categories;
  private BookStatus status;
  private String coverUrl;
  private LocalDate startDate;
  private LocalDate finishDate;
  private String notes;
}
