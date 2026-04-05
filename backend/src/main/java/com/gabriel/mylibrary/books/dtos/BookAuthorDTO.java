package com.gabriel.mylibrary.books.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookAuthorDTO {
  private String name;
  private long bookCount;
}
