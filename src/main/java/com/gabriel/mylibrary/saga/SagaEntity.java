package com.gabriel.mylibrary.saga;

import java.util.*;

import com.gabriel.mylibrary.books.BookEntity;
import com.gabriel.mylibrary.common.BaseEntity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Table(name = "saga")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class SagaEntity extends BaseEntity {

  @Max(100)
  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String description;

  @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private List<BookEntity> books = new ArrayList<>();
}
