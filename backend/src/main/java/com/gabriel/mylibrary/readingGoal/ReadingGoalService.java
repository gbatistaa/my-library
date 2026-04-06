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
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReadingGoalService {

  private static final String MSG_GOAL_REACHED = "Parabéns! Você já atingiu sua meta anual. Tudo o que você ler agora é um bônus!";
  private static final String MSG_ON_FIRE = "Você está voando! Streak de %d dias e no ritmo da meta. Imbatível!";
  private static final String MSG_BEHIND = "Atenção! Você está atrás do ritmo. Leia %d páginas hoje para recuperar!";
  private static final String MSG_ON_TRACK = "Caminho certo! %d páginas hoje mantêm você na meta. Boa leitura!";
  private static final String MSG_PROJECTED_REACHED = "Meta já atingida!";
  private static final String MSG_NO_READS_YET = "Comece a ler para gerar uma projeção";
  private static final DateTimeFormatter PROJECTED_DATE_FORMAT = DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy",
      Locale.of("pt", "BR"));

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
    return readingGoalRepository.findAllByUserId(userId).stream()
        .map(mapper::toDto)
        .toList();
  }

  @Transactional
  public void delete(UUID id, UUID userId) {
    ReadingGoalEntity entity = readingGoalRepository.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Reading goal not found with id: " + id));
    readingGoalRepository.delete(entity);
  }

  @Transactional
  public ReadingGoalDTO update(UUID id, UUID userId, UpdateReadingGoalDTO dto) {
    ReadingGoalEntity entity = readingGoalRepository.findByIdAndUserId(id, userId)
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
    long totalSeconds = readingSessionRepository.sumDurationByUserIdAndCreatedAtBetween(userId, startOfYearTime,
        endOfYearTime);
    long minutesRead = totalSeconds / 60;

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
      projectedFinishDate = MSG_PROJECTED_REACHED;
    } else if (currentPace <= 0) {
      projectedFinishDate = MSG_NO_READS_YET;
    } else {
      int weeksRemaining = (int) Math.ceil((goal.getTargetBooks() - booksRead) / currentPace);
      LocalDate projected = today.plusWeeks(weeksRemaining);
      projectedFinishDate = projected.format(PROJECTED_DATE_FORMAT);
    }

    // Streak
    StreakDTO streakData = streakService.getStreak(userId);

    // Diversity (filtered to goal year)
    long uniqueAuthors = bookRepository.countDistinctAuthorsByUserIdAndFinishDateBetween(userId, startOfYear,
        endOfYear);
    long uniqueGenres = bookRepository.countDistinctCategoriesByUserIdAndFinishDateBetween(userId, startOfYear,
        endOfYear);
    String topGenre = bookRepository.findTopCategoryByUserId(userId).orElse("Nenhum");

    // Authors/genres goal tracking
    boolean authorsGoalMet = goal.getTargetAuthors() != null && uniqueAuthors >= goal.getTargetAuthors();
    boolean genresGoalMet = goal.getTargetGenres() != null && uniqueGenres >= goal.getTargetGenres();

    // Minutes goal tracking
    boolean minutesGoalMet = goal.getTargetMinutes() != null && minutesRead >= goal.getTargetMinutes();
    int remainingMinutes = goal.getTargetMinutes() != null ? (int) Math.max(0, goal.getTargetMinutes() - minutesRead)
        : 0;
    int dailyMinutesGoal = goal.getTargetMinutes() != null ? (int) Math.ceil((double) remainingMinutes / daysRemaining)
        : 0;

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
        .targetAuthors(goal.getTargetAuthors())
        .targetGenres(goal.getTargetGenres())
        .authorsGoalMet(authorsGoalMet)
        .genresGoalMet(genresGoalMet)
        .minutesRead(minutesRead)
        .targetMinutes(goal.getTargetMinutes())
        .minutesGoalMet(minutesGoalMet)
        .dailyMinutesGoal(dailyMinutesGoal)
        .dailyPagesGoal(dailyPagesGoal)
        .dailyInsight(insight)
        .build();
  }

  private String generateInsight(int booksRead, int target, boolean onTrack, int dailyPages, int streak) {
    if (booksRead >= target) {
      return MSG_GOAL_REACHED;
    }
    if (streak >= 7 && onTrack) {
      return String.format(MSG_ON_FIRE, streak);
    }
    if (!onTrack) {
      return String.format(MSG_BEHIND, dailyPages);
    }
    return String.format(MSG_ON_TRACK, dailyPages);
  }
}
