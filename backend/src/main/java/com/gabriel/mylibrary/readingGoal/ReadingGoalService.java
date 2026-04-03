package com.gabriel.mylibrary.readingGoal;

import com.gabriel.mylibrary.books.BookRepository;
import com.gabriel.mylibrary.common.enums.BookStatus;
import com.gabriel.mylibrary.common.errors.ResourceConflictException;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;
import com.gabriel.mylibrary.readingGoal.dtos.*;
import com.gabriel.mylibrary.readingGoal.mappers.ReadingGoalMapper;
import com.gabriel.mylibrary.readingSession.ReadingSessionRepository;
import com.gabriel.mylibrary.streak.StreakDTO;
import com.gabriel.mylibrary.streak.StreakService;
import com.gabriel.mylibrary.user.UserEntity;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReadingGoalService {

  private final ReadingGoalRepository readingGoalRepository;
  private final BookRepository bookRepository;
  private final ReadingSessionRepository readingSessionRepository;
  private final ReadingGoalMapper mapper;
  private final EntityManager entityManager;
  private final StreakService streakService;

  @Transactional
  public ReadingGoalDTO create(UUID userId, CreateReadingGoalDTO dto) {
    if (readingGoalRepository.existsByUserIdAndYear(userId, dto.getYear())) {
      throw new ResourceConflictException("You already have a reading goal for the year " + dto.getYear());
    }

    ReadingGoalEntity entity = mapper.toEntity(dto);
    entity.setUser(entityManager.getReference(UserEntity.class, userId));
    return mapper.toDto(readingGoalRepository.save(entity));
  }

  @Transactional(readOnly = true)
  public ReadingGoalDTO getGoal(UUID userId, Integer year) {
    return readingGoalRepository.findByUserIdAndYear(userId, year)
        .map(mapper::toDto)
        .orElseThrow(() -> new ResourceNotFoundException("No reading goal found for user in year " + year));
  }

  @Transactional(readOnly = true)
  public List<ReadingGoalDTO> listAll(UUID userId) {
    return readingGoalRepository.findAll().stream() // Not ideal, should be findByUserId
        .filter(goal -> goal.getUser().getId().equals(userId))
        .map(mapper::toDto)
        .toList();
  }

  @Transactional
  public ReadingGoalDTO update(UUID id, UUID userId, UpdateReadingGoalDTO dto) {
    ReadingGoalEntity entity = readingGoalRepository.findById(id)
        .filter(goal -> goal.getUser().getId().equals(userId))
        .orElseThrow(() -> new ResourceNotFoundException("Reading goal not found with id: " + id));

    mapper.updateEntityFromDto(dto, entity);
    return mapper.toDto(readingGoalRepository.save(entity));
  }

  @Transactional(readOnly = true)
  public ReadingGoalProgressDTO getProgress(UUID userId, Integer year) {
    ReadingGoalEntity goal = readingGoalRepository.findByUserIdAndYear(userId, year)
        .orElseThrow(() -> new ResourceNotFoundException("No reading goal found for user in year " + year));

    LocalDate startOfYear = LocalDate.of(year, 1, 1);
    LocalDate endOfYear = LocalDate.of(year, 12, 31);
    LocalDateTime startOfYearTime = startOfYear.atStartOfDay();
    LocalDateTime endOfYearTime = endOfYear.atTime(23, 59, 59);

    int booksRead = bookRepository.countByUserIdAndStatusAndFinishDateBetween(userId, BookStatus.COMPLETED, startOfYear,
        endOfYear);
    int pagesRead = readingSessionRepository.sumPagesReadByUserIdAndCreatedAtBetween(userId, startOfYearTime,
        endOfYearTime);

    int daysInYear = Year.of(year).length();
    LocalDate today = LocalDate.now();
    int currentDayOfYear;
    int daysRemaining;

    if (today.getYear() > year) {
      currentDayOfYear = daysInYear;
      daysRemaining = 0;
    } else if (today.getYear() < year) {
      currentDayOfYear = 1;
      daysRemaining = daysInYear;
    } else {
      currentDayOfYear = today.getDayOfYear();
      daysRemaining = Math.max(1, daysInYear - currentDayOfYear);
    }

    // Pace calculations
    double weeksElapsed = Math.max(1, currentDayOfYear / 7.0);
    double currentPace = booksRead / weeksElapsed;
    double dailyPaceRequired = (double) Math.max(0, goal.getTargetBooks() - booksRead) / daysRemaining;
    double expectedBooks = (double) goal.getTargetBooks() / daysInYear * currentDayOfYear;
    boolean onTrack = booksRead >= (expectedBooks * 0.9);

    // Projected finish date
    String projectedFinishDate;
    if (booksRead >= goal.getTargetBooks()) {
      projectedFinishDate = "🏆 Meta já atingida!";
    } else if (currentPace <= 0) {
      projectedFinishDate = "Comece a ler para gerar uma projeção";
    } else {
      int weeksRemaining = (int) Math.ceil((goal.getTargetBooks() - booksRead) / currentPace);
      LocalDate projected = today.plusWeeks(weeksRemaining);
      projectedFinishDate = projected.format(DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy"));
    }

    // Streak
    StreakDTO streakData = streakService.getStreak(userId);

    // Diversity
    long uniqueAuthors = bookRepository.countDistinctAuthorsByUserId(userId);
    long uniqueGenres = bookRepository.countDistinctCategoriesByUserId(userId);
    List<Object[]> genreStats = bookRepository.countBooksByCategory(userId);
    String topGenre = genreStats.isEmpty() ? "Nenhum" : (String) genreStats.get(0)[0];

    // Micro-victories
    int remainingPages = goal.getTargetPages() != null ? Math.max(0, goal.getTargetPages() - pagesRead) : 0;
    int dailyPagesGoal = goal.getTargetPages() != null ? (int) Math.ceil((double) remainingPages / daysRemaining) : 0;

    // Daily Insight
    String insight = generateInsight(booksRead, goal.getTargetBooks(), onTrack, dailyPagesGoal,
        streakData.getCurrentStreak());

    return ReadingGoalProgressDTO.builder()
        .goal(mapper.toDto(goal))
        .booksRead(booksRead)
        .pagesRead(pagesRead)
        .dailyPaceRequired(dailyPaceRequired)
        .currentPace(currentPace)
        .projectedFinishDate(projectedFinishDate)
        .onTrack(onTrack)
        .currentStreak(streakData.getCurrentStreak())
        .bestStreak(streakData.getBestStreak())
        .streakInsight(streakData.getInsight())
        .uniqueAuthors((int) uniqueAuthors)
        .uniqueGenres((int) uniqueGenres)
        .topGenre(topGenre)
        .dailyPagesGoal(dailyPagesGoal)
        .dailyInsight(insight)
        .build();
  }

  private String generateInsight(int booksRead, int target, boolean onTrack, int dailyPages, int streak) {
    if (booksRead >= target) {
      return "🏆 Parabéns! Você já atingiu sua meta anual. Tudo o que você ler agora é um bônus!";
    }
    if (streak >= 7 && onTrack) {
      return "🔥 Você está voando! Streak de " + streak + " dias e no ritmo da meta. Imbatível!";
    }
    if (!onTrack) {
      return "⚠️ Atenção! Você está atrás do ritmo. Leia " + dailyPages + " páginas hoje para recuperar!";
    }
    return "📖 Caminho certo! " + dailyPages + " páginas hoje mantêm você na meta. Boa leitura!";
  }
}
