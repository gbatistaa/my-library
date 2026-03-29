package com.gabriel.mylibrary.achievement;

import com.gabriel.mylibrary.common.BaseEntity;
import com.gabriel.mylibrary.user.UserEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "user_achievements", uniqueConstraints = {
    @UniqueConstraint(name = "uk_user_achievement", columnNames = { "user_id", "code" })
})
@Getter
@Setter
@NoArgsConstructor
public class UserAchievementEntity extends BaseEntity {

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 50)
  private AchievementDefinition code;

  @Column(name = "earned_at", nullable = false)
  private LocalDate earnedAt;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private UserEntity user;
}
