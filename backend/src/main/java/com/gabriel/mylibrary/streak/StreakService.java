package com.gabriel.mylibrary.streak;

import com.gabriel.mylibrary.user.UserEntity;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StreakService {

  private final StreakRepository streakRepository;
  private final EntityManager entityManager;

  @Transactional(readOnly = true)
  public StreakDTO getStreak(UUID userId) {
    StreakEntity streak = getOrCreateStreak(userId);

    String insight = generateInsight(streak);

    return new StreakDTO(
        streak.getCurrentStreak(),
        streak.getBestStreak(),
        streak.getTotalReadingDays(),
        streak.getLastReadingDate(),
        insight);
  }

  /**
   * Records a reading activity for today.
   *
   * @return true if this is the first activity of the day (new reading day),
   *         false if already recorded today.
   */
  @Transactional
  public boolean recordActivity(UUID userId) {
    StreakEntity streak = getOrCreateStreak(userId);
    LocalDate today = LocalDate.now();

    if (today.equals(streak.getLastReadingDate())) {
      return false;
    }

    if (streak.getLastReadingDate() == null) {
      streak.setCurrentStreak(1);
    } else {
      long daysBetween = ChronoUnit.DAYS.between(streak.getLastReadingDate(), today);

      if (daysBetween == 1) {
        streak.setCurrentStreak(streak.getCurrentStreak() + 1);
      } else {
        streak.setCurrentStreak(1);
      }
    }

    if (streak.getCurrentStreak() > streak.getBestStreak()) {
      streak.setBestStreak(streak.getCurrentStreak());
    }

    streak.setTotalReadingDays(streak.getTotalReadingDays() + 1);
    streak.setLastReadingDate(today);
    streakRepository.save(streak);
    return true;
  }

  @Transactional
  public void resetStreak() {
    LocalDate yesterday = LocalDate.now().minusDays(1);
    streakRepository.resetStreaksOlderThan(yesterday);
  }

  private StreakEntity getOrCreateStreak(UUID userId) {
    return streakRepository.findByUserId(userId)
        .orElseGet(() -> {
          StreakEntity newStreak = new StreakEntity();
          newStreak.setUser(entityManager.getReference(UserEntity.class, userId));
          return streakRepository.save(newStreak);
        });
  }

  private String generateInsight(StreakEntity streak) {
    if (streak.getLastReadingDate() == null) {
      return "📚 Start your journey! Register your first reading session.";
    }

    LocalDate today = LocalDate.now();
    long daysSinceLastRead = ChronoUnit.DAYS.between(streak.getLastReadingDate(), today);

    if (daysSinceLastRead == 0) {
      int gapToBest = streak.getBestStreak() - streak.getCurrentStreak();
      if (gapToBest <= 0) {
        return "🏆 New record! You're on your best streak " + streak.getCurrentStreak() + " Dias!";
      } else if (gapToBest <= 3) {
        return "🔥 You are just " + gapToBest + " days of your record " + streak.getBestStreak() + " Dias!";
      }
      return "✅ You've already read it today! Current streak: " + streak.getCurrentStreak() + " Dias.";
    } else if (daysSinceLastRead == 1) {
      return "⚠️ Read today so you don't lose your streak " + streak.getCurrentStreak() + " Dias!";
    } else {
      return "💪 Back in the game? Did you read " + streak.getTotalReadingDays()
          + " days in total. Start a new streak today!";
    }
  }
}
