package com.gabriel.mylibrary.streak;

import com.gabriel.mylibrary.common.BaseEntity;
import com.gabriel.mylibrary.user.UserEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "streaks")
@Getter
@Setter
@NoArgsConstructor
public class StreakEntity extends BaseEntity {

  @Column(name = "last_reading_date")
  private LocalDate lastReadingDate;

  @Column(name = "current_streak", nullable = false)
  private int currentStreak = 0;

  @Column(name = "best_streak", nullable = false)
  private int bestStreak = 0;

  @Column(name = "total_reading_days", nullable = false)
  private int totalReadingDays = 0;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private UserEntity user;
}
