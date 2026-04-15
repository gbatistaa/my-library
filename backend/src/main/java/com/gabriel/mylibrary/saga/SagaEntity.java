package com.gabriel.mylibrary.saga;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import com.gabriel.mylibrary.books.userBook.UserBookEntity;
import com.gabriel.mylibrary.common.BaseEntity;
import com.gabriel.mylibrary.common.errors.ResourceConflictException;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
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
  private List<UserBookEntity> userBooks = new ArrayList<>();

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false, updatable = false)
  private UserEntity user;

  public void addUserBook(UserBookEntity userBook) {
    boolean alreadyExists = userBooks.stream()
        .anyMatch(ub -> Objects.equals(ub.getId(), userBook.getId()));

    if (alreadyExists) {
      throw new ResourceConflictException(
          "'" + userBook.getBook().getTitle() + "' is already part of this saga.");
    }

    userBook.setSaga(this);
    userBooks.add(userBook);
  }

  public void removeUserBook(UserBookEntity userBook) {
    boolean alreadyExists = userBooks.stream()
        .anyMatch(ub -> Objects.equals(ub.getId(), userBook.getId()));

    if (!alreadyExists) {
      throw new ResourceConflictException(
          "'" + userBook.getBook().getTitle() + "' could not be removed because it does not belong to this saga.");
    }

    userBook.setSaga(null);
    userBooks.remove(userBook);
  }
}
