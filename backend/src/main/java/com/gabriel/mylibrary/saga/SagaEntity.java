package com.gabriel.mylibrary.saga;

import java.util.*;

import com.gabriel.mylibrary.books.BookEntity;
import com.gabriel.mylibrary.common.BaseEntity;
import com.gabriel.mylibrary.common.errors.ResourceConflictException;
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
  @Column
  private String description;

  @Column
  private String coverUrl;

  @OneToMany(mappedBy = "saga", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private List<BookEntity> books = new ArrayList<>();

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false, updatable = false)
  private UserEntity user;

  public void addBook(BookEntity book) {
    boolean alreadyExists = books.stream()
        .anyMatch(b -> Objects.equals(b.getId(), book.getId()));

    if (alreadyExists) {
      throw new ResourceConflictException("'" + book.getTitle() + "' is already part of this saga.");
    }

    book.setSaga(this);
    books.add(book);
  }

  public void removeBook(BookEntity book) {
    boolean alreadyExists = books.stream()
        .anyMatch(b -> Objects.equals(b.getId(), book.getId()));

    if (!alreadyExists) {
      throw new ResourceConflictException("'" + book.getTitle() + "' could not be removed because it does not belong to this saga.");
    }

    book.setSaga(null);
    books.remove(book);
  }
}
