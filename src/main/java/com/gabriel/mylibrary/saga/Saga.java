package com.gabriel.mylibrary.saga;

import java.util.*;

import com.gabriel.mylibrary.books.Book;
import com.gabriel.mylibrary.common.BaseEntity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import lombok.AllArgsConstructor;

@Table(name = "saga")
@AllArgsConstructor
@Entity
public class Saga extends BaseEntity {

  @Max(100)
  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String description;

  @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private List<Book> books = new ArrayList<>();
}
