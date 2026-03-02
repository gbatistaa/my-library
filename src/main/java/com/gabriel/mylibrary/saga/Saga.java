package com.gabriel.mylibrary.saga;

import com.gabriel.mylibrary.common.BaseEntity;
import com.gabriel.mylibrary.common.pipes.DatabaseEntity;
import jakarta.persistence.Column;

@DatabaseEntity(tableName = "saga")
public class Saga extends BaseEntity {

  @Column(name = "name", nullable = false, length = 100)
  private String name;

  @Column(name = "description", nullable = false)
  private String description;

  @Column(name = "total_books")
  private Integer totalBooks;
}
