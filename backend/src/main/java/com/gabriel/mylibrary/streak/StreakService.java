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
   * @return true if this is the first activity of the day (new reading day), false if already recorded today.
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
      return "📚 Comece sua jornada! Registre sua primeira sessão de leitura.";
    }

    LocalDate today = LocalDate.now();
    long daysSinceLastRead = ChronoUnit.DAYS.between(streak.getLastReadingDate(), today);

    if (daysSinceLastRead == 0) {
      int gapToBest = streak.getBestStreak() - streak.getCurrentStreak();
      if (gapToBest <= 0) {
        return "🏆 Novo recorde! Você está no seu melhor streak de " + streak.getCurrentStreak() + " dias!";
      } else if (gapToBest <= 3) {
        return "🔥 Você está a apenas " + gapToBest + " dias do seu recorde de " + streak.getBestStreak() + " dias!";
      }
      return "✅ Você já leu hoje! Streak atual: " + streak.getCurrentStreak() + " dias.";
    } else if (daysSinceLastRead == 1) {
      return "⚠️ Leia hoje para não perder seu streak de " + streak.getCurrentStreak() + " dias!";
    } else {
      return "💪 De volta ao jogo? Você leu " + streak.getTotalReadingDays()
          + " dias no total. Comece um novo streak hoje!";
    }
  }
}
