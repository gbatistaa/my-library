package com.gabriel.mylibrary.books;

import com.gabriel.mylibrary.common.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "books", uniqueConstraints = {
    @UniqueConstraint(name = "books_author", columnNames = { "name", "author" })
})
public class Book extends BaseEntity {

  @Column(name = "name", nullable = false, length = 100)
  private String name;

  @Column(name = "author", nullable = false, length = 255)
  private String author;

  @Column(name = )
}
