package com.gabriel.mylibrary.books.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookCategoryDTO {
  private String id;
  private String name;
  private String color;
}
