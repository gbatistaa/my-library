package com.gabriel.mylibrary.user;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
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

  @JsonIgnore
  @Size(min = 8, max = 255)
  @Column(nullable = false)
  private String password;

  @Column(name = "birth_date", nullable = false)
  private LocalDate birthDate;

  @Column(name = "profile_pic_path")
  private String profilePicPath;

  @Column(name = "total_experience", nullable = false, columnDefinition = "bigint default 0")
  private Long totalExperience = 0L;

  @Column(nullable = false, columnDefinition = "integer default 1")
  private Integer level = 1;

  @Column(name = "current_xp", nullable = false, columnDefinition = "bigint default 0")
  private Long currentXp = 0L;

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
