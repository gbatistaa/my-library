package com.gabriel.mylibrary.readingGoal;

import com.gabriel.mylibrary.common.BaseEntity;
import com.gabriel.mylibrary.user.UserEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "reading_goals", uniqueConstraints = {
    @UniqueConstraint(name = "uk_reading_goals_user_year", columnNames = { "user_id", "goal_year" })
})
@Getter
@Setter
@NoArgsConstructor
public class ReadingGoalEntity extends BaseEntity {

  @Column(name = "goal_year", nullable = false)
  private Integer year;

  @Column(name = "target_books", nullable = false)
  private Integer targetBooks;

  @Column(name = "target_pages", nullable = false)
  private Integer targetPages;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private UserEntity user;
}
