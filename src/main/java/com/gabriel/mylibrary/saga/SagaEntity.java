package com.gabriel.mylibrary.saga;

import java.util.*;

import com.gabriel.mylibrary.books.BookEntity;
import com.gabriel.mylibrary.common.BaseEntity;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sagas", uniqueConstraints = {
    @UniqueConstraint(name = "uk_sagas_user_name", columnNames = { "user_id", "name" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SagaEntity extends BaseEntity {

  @Size(max = 100)
  @Column(nullable = false)
  private String name;

  @Size(max = 255)
  @Column(nullable = false)
  private String description;

  @OneToMany(mappedBy = "saga", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private List<BookEntity> books = new ArrayList<>();

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false, updatable = false)
  private UserEntity user;
}
