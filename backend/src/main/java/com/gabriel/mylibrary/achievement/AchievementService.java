package com.gabriel.mylibrary.achievement;

import com.gabriel.mylibrary.books.BookRepository;
import com.gabriel.mylibrary.common.enums.BookStatus;
import com.gabriel.mylibrary.readingSession.ReadingSessionRepository;
import com.gabriel.mylibrary.streak.StreakEntity;
import com.gabriel.mylibrary.streak.StreakRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AchievementService {

  private final UserAchievementRepository achievementRepository;
  private final BookRepository bookRepository;
  private final ReadingSessionRepository readingSessionRepository;
  private final StreakRepository streakRepository;

  @Transactional(readOnly = true)
  public List<AchievementDTO> getAllWithProgress(UUID userId) {
    Set<AchievementDefinition> earned = achievementRepository.findAllByUserId(userId).stream()
        .map(UserAchievementEntity::getCode)
        .collect(Collectors.toSet());

    Map<AchievementDefinition, java.time.LocalDate> earnedDates = achievementRepository.findAllByUserId(userId).stream()
        .collect(Collectors.toMap(UserAchievementEntity::getCode, UserAchievementEntity::getEarnedAt));

    return Arrays.stream(AchievementDefinition.values())
        .map(def -> {
          boolean isEarned = earned.contains(def);
          double progress = isEarned ? 1.0 : calculateProgress(def, userId);
          String progressLabel = isEarned ? "Conquistada!" : generateProgressLabel(def, userId);

          return AchievementDTO.builder()
              .code(def.name())
              .name(def.getName())
              .description(def.getDescription())
              .category(def.getCategory())
              .earned(isEarned)
              .earnedAt(earnedDates.get(def))
              .progress(progress)
              .progressLabel(progressLabel)
              .build();
        })
        .toList();
  }

  @Transactional(readOnly = true)
  public List<AchievementDTO> getRecent(UUID userId) {
    return achievementRepository.findTop3ByUserIdOrderByEarnedAtDesc(userId).stream()
        .map(entity -> AchievementDTO.builder()
            .code(entity.getCode().name())
            .name(entity.getCode().getName())
            .description(entity.getCode().getDescription())
            .category(entity.getCode().getCategory())
            .earned(true)
            .earnedAt(entity.getEarnedAt())
            .progress(1.0)
            .progressLabel("Conquistada!")
            .build())
        .toList();
  }

  private double calculateProgress(AchievementDefinition def, UUID userId) {
    double current = switch (def) {
      case FIRST_BOOK, BOOKWORM, CENTURION ->
        (double) bookRepository.countByUserIdAndStatus(userId, BookStatus.COMPLETED);
      case PAGE_TURNER ->
        (double) readingSessionRepository.sumAllPagesReadByUserId(userId);
      case IRON_READER, HABIT_FORMED ->
        (double) streakRepository.findByUserId(userId).map(StreakEntity::getCurrentStreak).orElse(0);
      case GENRE_EXPLORER ->
        (double) bookRepository.countDistinctGenresByUserId(userId);
      case NEW_VOICE ->
        (double) bookRepository.countDistinctAuthorsByUserId(userId);
      default -> 0.0;
    };

    return Math.min(1.0, current / def.getThreshold());
  }

  private String generateProgressLabel(AchievementDefinition def, UUID userId) {
    return switch (def) {
      case FIRST_BOOK, BOOKWORM, CENTURION -> {
        long count = bookRepository.countByUserIdAndStatus(userId, BookStatus.COMPLETED);
        yield count + " de " + def.getThreshold() + " livros";
      }
      case PAGE_TURNER -> {
        int pages = readingSessionRepository.sumAllPagesReadByUserId(userId);
        yield pages + " de " + def.getThreshold() + " páginas";
      }
      case IRON_READER, HABIT_FORMED -> {
        int streak = streakRepository.findByUserId(userId).map(StreakEntity::getCurrentStreak).orElse(0);
        yield streak + " de " + def.getThreshold() + " dias";
      }
      case GENRE_EXPLORER -> {
        long genres = bookRepository.countDistinctGenresByUserId(userId);
        yield genres + " de " + def.getThreshold() + " gêneros";
      }
      case NEW_VOICE -> {
        long authors = bookRepository.countDistinctAuthorsByUserId(userId);
        yield authors + " de " + def.getThreshold() + " autores";
      }
      default -> "Em progresso";
    };
  }
}
