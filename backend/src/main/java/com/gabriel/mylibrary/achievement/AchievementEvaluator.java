package com.gabriel.mylibrary.achievement;

import com.gabriel.mylibrary.books.BookEntity;
import com.gabriel.mylibrary.books.BookRepository;
import com.gabriel.mylibrary.common.enums.BookStatus;
import com.gabriel.mylibrary.readingGoal.ReadingGoalRepository;
import com.gabriel.mylibrary.readingSession.ReadingSessionRepository;
import com.gabriel.mylibrary.streak.StreakEntity;
import com.gabriel.mylibrary.streak.StreakRepository;
import com.gabriel.mylibrary.user.UserEntity;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AchievementEvaluator {

  private final UserAchievementRepository achievementRepository;
  private final BookRepository bookRepository;
  private final ReadingSessionRepository readingSessionRepository;
  private final ReadingGoalRepository readingGoalRepository;
  private final StreakRepository streakRepository;
  private final EntityManager entityManager;

  @Transactional
  public void evaluate(UUID userId) {
    for (AchievementDefinition def : AchievementDefinition.values()) {
      if (achievementRepository.existsByUserIdAndCode(userId, def)) {
        continue; // Already earned
      }
      if (checkAchievement(def, userId)) {
        grant(def, userId);
      }
    }
  }

  private boolean checkAchievement(AchievementDefinition def, UUID userId) {
    LocalDate today = LocalDate.now();
    int year = today.getYear();
    LocalDate startOfYear = LocalDate.of(year, 1, 1);
    LocalDate endOfYear = LocalDate.of(year, 12, 31);

    return switch (def) {
      case FIRST_BOOK -> countCompletedBooks(userId) >= 1;

      case BOOKWORM -> countCompletedBooks(userId) >= 10;

      case CENTURION -> countCompletedBooks(userId) >= 100;

      case PAGE_TURNER -> totalPagesRead(userId) >= 10000;

      case IRON_READER -> getCurrentStreak(userId) >= 30;

      case HABIT_FORMED -> getCurrentStreak(userId) >= 7;

      case SPEED_DEMON -> hasBookCompletedInDays(userId, 3);

      case MARATHON -> hasMarathonSession(userId, 180);

      case BINGE_READER -> booksCompletedInLastWeek(userId) >= 3;

      case GENRE_EXPLORER -> countUniqueGenres(userId) >= 5;

      case SAGA_SLAYER -> hasCompletedSaga(userId);

      case NEW_VOICE -> countUniqueAuthors(userId) >= 10;

      case CONTRARIAN -> hasContrarianRatings(userId);

      case GOAL_CRUSHER -> hasCrushedGoal(userId, year);

      case COMEBACK_KID -> hasComeback(userId);

      case DNF_ZERO -> hasCleanYear(userId, startOfYear, endOfYear);
    };
  }

  private void grant(AchievementDefinition def, UUID userId) {
    UserAchievementEntity achievement = new UserAchievementEntity();
    achievement.setCode(def);
    achievement.setEarnedAt(LocalDate.now());
    achievement.setUser(entityManager.getReference(UserEntity.class, userId));
    achievementRepository.save(achievement);
  }

  // === Helper methods ===

  private long countCompletedBooks(UUID userId) {
    return bookRepository.countByUserIdAndStatus(userId, BookStatus.COMPLETED);
  }

  private int totalPagesRead(UUID userId) {
    return readingSessionRepository.sumAllPagesReadByUserId(userId);
  }

  private int getCurrentStreak(UUID userId) {
    return streakRepository.findByUserId(userId)
        .map(StreakEntity::getCurrentStreak)
        .orElse(0);
  }

  private boolean hasBookCompletedInDays(UUID userId, int maxDays) {
    return bookRepository.findAllCompletedByUserId(userId).stream()
        .anyMatch(book -> {
          if (book.getStartDate() == null || book.getFinishDate() == null)
            return false;
          long days = ChronoUnit.DAYS.between(book.getStartDate(), book.getFinishDate());
          return days <= maxDays && days >= 0;
        });
  }

  private boolean hasMarathonSession(UUID userId, int minMinutes) {
    return readingSessionRepository.findAllByUserId(userId).stream()
        .anyMatch(s -> s.getDurationSeconds() >= minMinutes);
  }

  private long booksCompletedInLastWeek(UUID userId) {
    LocalDate weekAgo = LocalDate.now().minusWeeks(1);
    return bookRepository.countByUserIdAndStatusAndFinishDateBetween(
        userId, BookStatus.COMPLETED, weekAgo, LocalDate.now());
  }

  private long countUniqueGenres(UUID userId) {
    return bookRepository.countDistinctCategoriesByUserId(userId);
  }

  private long countUniqueAuthors(UUID userId) {
    return bookRepository.countDistinctAuthorsByUserId(userId);
  }

  private boolean hasCompletedSaga(UUID userId) {
    return bookRepository.hasCompletedSaga(userId);
  }

  private boolean hasContrarianRatings(UUID userId) {
    LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
    LocalDate endOfMonth = startOfMonth.plusMonths(1).minusDays(1);
    List<BookEntity> monthBooks = bookRepository.findCompletedByUserIdAndFinishDateBetween(
        userId, startOfMonth, endOfMonth);
    boolean hasOne = monthBooks.stream().anyMatch(b -> b.getRating() != null && b.getRating() == 1);
    boolean hasFive = monthBooks.stream().anyMatch(b -> b.getRating() != null && b.getRating() == 5);
    return hasOne && hasFive;
  }

  private boolean hasCrushedGoal(UUID userId, int year) {
    return readingGoalRepository.findByUserIdAndYear(userId, year)
        .map(goal -> {
          int completed = bookRepository.countByUserIdAndStatusAndFinishDateBetween(
              userId, BookStatus.COMPLETED,
              LocalDate.of(year, 1, 1), LocalDate.of(year, 12, 31));
          return completed >= (goal.getTargetBooks() * 1.2);
        })
        .orElse(false);
  }

  private boolean hasComeback(UUID userId) {
    return streakRepository.findByUserId(userId)
        .map(streak -> {
          if (streak.getLastReadingDate() == null)
            return false;
          LocalDate today = LocalDate.now();
          return today.equals(streak.getLastReadingDate()) && streak.getCurrentStreak() == 1
              && streak.getTotalReadingDays() > 1;
        })
        .orElse(false);
  }

  private boolean hasCleanYear(UUID userId, LocalDate startOfYear, LocalDate endOfYear) {
    long dropped = bookRepository.countByUserIdAndStatusAndFinishDateBetween(
        userId, BookStatus.DROPPED, startOfYear, endOfYear);
    long completed = bookRepository.countByUserIdAndStatusAndFinishDateBetween(
        userId, BookStatus.COMPLETED, startOfYear, endOfYear);
    return dropped == 0 && completed > 0;
  }
}
