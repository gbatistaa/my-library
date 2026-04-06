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
    List<UserAchievementEntity> userAchievements = achievementRepository.findAllByUserId(userId);
    Set<AchievementDefinition> earned = userAchievements.stream()
        .map(UserAchievementEntity::getCode)
        .collect(Collectors.toSet());
    Map<AchievementDefinition, java.time.LocalDate> earnedDates = userAchievements.stream()
        .collect(Collectors.toMap(UserAchievementEntity::getCode, UserAchievementEntity::getEarnedAt));

    AchievementContext ctx = buildContext(userId, earned);

    return Arrays.stream(AchievementDefinition.values())
        .map(def -> {
          boolean isEarned = earned.contains(def);
          double progress = isEarned ? 1.0 : calculateProgress(def, ctx);
          String progressLabel = isEarned ? "Conquistada!" : generateProgressLabel(def, ctx);

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

  private record AchievementContext(
      long completedBooks,
      int totalPages,
      int currentStreak,
      long distinctCategories,
      long distinctAuthors
  ) {}

  private AchievementContext buildContext(UUID userId, Set<AchievementDefinition> earned) {
    // Only fetch what's needed for unearned achievements
    boolean needsBooks = !earned.containsAll(Set.of(AchievementDefinition.FIRST_BOOK, AchievementDefinition.BOOKWORM, AchievementDefinition.CENTURION));
    boolean needsPages = !earned.contains(AchievementDefinition.PAGE_TURNER);
    boolean needsStreak = !earned.containsAll(Set.of(AchievementDefinition.IRON_READER, AchievementDefinition.HABIT_FORMED));
    boolean needsCategories = !earned.contains(AchievementDefinition.GENRE_EXPLORER);
    boolean needsAuthors = !earned.contains(AchievementDefinition.NEW_VOICE);

    return new AchievementContext(
        needsBooks ? bookRepository.countByUserIdAndStatus(userId, BookStatus.COMPLETED) : 0,
        needsPages ? readingSessionRepository.sumAllPagesReadByUserId(userId) : 0,
        needsStreak ? streakRepository.findByUserId(userId).map(StreakEntity::getCurrentStreak).orElse(0) : 0,
        needsCategories ? bookRepository.countDistinctCategoriesByUserId(userId) : 0,
        needsAuthors ? bookRepository.countDistinctAuthorsByUserId(userId) : 0
    );
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

  private double calculateProgress(AchievementDefinition def, AchievementContext ctx) {
    double current = switch (def) {
      case FIRST_BOOK, BOOKWORM, CENTURION -> (double) ctx.completedBooks();
      case PAGE_TURNER -> (double) ctx.totalPages();
      case IRON_READER, HABIT_FORMED -> (double) ctx.currentStreak();
      case GENRE_EXPLORER -> (double) ctx.distinctCategories();
      case NEW_VOICE -> (double) ctx.distinctAuthors();
      default -> 0.0;
    };
    return Math.min(1.0, current / def.getThreshold());
  }

  private String generateProgressLabel(AchievementDefinition def, AchievementContext ctx) {
    return switch (def) {
      case FIRST_BOOK, BOOKWORM, CENTURION ->
          ctx.completedBooks() + " de " + def.getThreshold() + " livros";
      case PAGE_TURNER ->
          ctx.totalPages() + " de " + def.getThreshold() + " páginas";
      case IRON_READER, HABIT_FORMED ->
          ctx.currentStreak() + " de " + def.getThreshold() + " dias";
      case GENRE_EXPLORER ->
          ctx.distinctCategories() + " de " + def.getThreshold() + " categorias";
      case NEW_VOICE ->
          ctx.distinctAuthors() + " de " + def.getThreshold() + " autores";
      default -> "Em progresso";
    };
  }
}
