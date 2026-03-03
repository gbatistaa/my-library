package com.gabriel.mylibrary.books.dtos;

import com.gabriel.mylibrary.common.enums.BookStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookDTO {
  private String name;
  private String author;
  private Integer rating;
  private Integer pages;
  private String isbn;
  private String genre;
  private BookStatus status;
}
