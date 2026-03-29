package com.gabriel.mylibrary.user;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.gabriel.mylibrary.auth.tokens.RefreshTokenEntity;
import com.gabriel.mylibrary.books.BookEntity;
import com.gabriel.mylibrary.categories.CategoryEntity;
import com.gabriel.mylibrary.common.BaseEntity;
import com.gabriel.mylibrary.readingGoal.ReadingGoalEntity;
import com.gabriel.mylibrary.readingSession.ReadingSessionEntity;
import com.gabriel.mylibrary.saga.SagaEntity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(name = "users_username_email_unique", columnNames = { "username", "email" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity extends BaseEntity {
  @Size(max = 100)
  @Column(nullable = false)
  private String name;

  @Size(max = 30)
  @Column(nullable = false, unique = true)
  private String username;

  @Size(max = 100)
  @Column(nullable = false, unique = true)
  private String email;

  @Size(min = 8, max = 255)
  @Column(nullable = false)
  private String password;

  @Column(name = "birth_date", nullable = false)
  private LocalDate birthDate;

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  private List<RefreshTokenEntity> refreshTokens = new ArrayList<>();

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  private List<BookEntity> books = new ArrayList<>();

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  private List<CategoryEntity> categories = new ArrayList<>();

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  private List<SagaEntity> sagas = new ArrayList<>();

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  private List<ReadingSessionEntity> readingSessions = new ArrayList<>();

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  private List<ReadingGoalEntity> readingGoals = new ArrayList<>();
}
