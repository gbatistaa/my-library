package com.gabriel.mylibrary.saga;

import java.util.*;

import com.gabriel.mylibrary.books.BookEntity;
import com.gabriel.mylibrary.common.BaseEntity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sagas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SagaEntity extends BaseEntity {

  @Size(max = 100)
  @Column(nullable = false, unique = true)
  private String name;

  @Size(max = 255)
  @Column(nullable = false)
  private String description;

  @OneToMany(mappedBy = "saga", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private List<BookEntity> books = new ArrayList<>();
}
