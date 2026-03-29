package com.gabriel.mylibrary.readingGoal;

import com.gabriel.mylibrary.books.BookRepository;
import com.gabriel.mylibrary.common.enums.BookStatus;
import com.gabriel.mylibrary.common.errors.ResourceConflictException;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;
import com.gabriel.mylibrary.readingGoal.dtos.*;
import com.gabriel.mylibrary.readingGoal.mappers.ReadingGoalMapper;
import com.gabriel.mylibrary.readingSession.ReadingSessionRepository;
import com.gabriel.mylibrary.user.UserEntity;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReadingGoalService {

  private final ReadingGoalRepository readingGoalRepository;
  private final BookRepository bookRepository;
  private final ReadingSessionRepository readingSessionRepository;
  private final ReadingGoalMapper mapper;
  private final EntityManager entityManager;

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
      daysRemaining = daysInYear - currentDayOfYear;
      if (daysRemaining <= 0)
        daysRemaining = 1; // prevent division by zero near end of year
    }

    // Book Pace
    double expectedBooks = (double) goal.getTargetBooks() / daysInYear * currentDayOfYear;
    String bookPace = determinePace(booksRead, expectedBooks);

    // Page Pace
    double expectedPages = (double) goal.getTargetPages() / daysInYear * currentDayOfYear;
    String pagePace = determinePace(pagesRead, expectedPages);

    // Projections
    int projectedBooks = currentDayOfYear == 0 ? 0 : (int) ((double) booksRead / currentDayOfYear * daysInYear);
    int projectedPages = currentDayOfYear == 0 ? 0 : (int) ((double) pagesRead / currentDayOfYear * daysInYear);

    // Micro-victories
    int remainingPages = Math.max(0, goal.getTargetPages() - pagesRead);
    int dailyPagesTarget = daysRemaining == 0 ? 0 : (int) Math.ceil((double) remainingPages / daysRemaining);

    int remainingBooks = Math.max(0, goal.getTargetBooks() - booksRead);
    double dailyBooksTarget = daysRemaining == 0 ? 0 : (double) remainingBooks / daysRemaining;

    // Daily Insight Logic
    String insight;
    if (pagesRead >= goal.getTargetPages() && booksRead >= goal.getTargetBooks()) {
      insight = "🏆 Parabéns! Você já atingiu sua meta anual. Tudo o que você ler agora é um bônus para o seu cérebro!";
    } else if ("AHEAD".equals(pagePace) && "AHEAD".equals(bookPace)) {
      insight = "🔥 Você está voando! Mantenha esse ritmo incrível e você destruirá sua meta muito antes de dezembro.";
    } else if ("BEHIND".equals(pagePace)) {
      insight = "⚠️ Atenção! Você está um pouco atrás no ritmo de leitura. Que tal ler " + dailyPagesTarget
          + " páginas hoje para recuperar o fôlego?";
    } else {
      insight = "📖 Você está no caminho certo. Apenas " + dailyPagesTarget
          + " páginas hoje mantêm você no trilho. Boa leitura!";
    }

    return ReadingGoalProgressDTO.builder()
        .goal(mapper.toDto(goal))
        .booksRead(booksRead)
        .pagesRead(pagesRead)
        .bookPaceStatus(bookPace)
        .pagePaceStatus(pagePace)
        .projectedBooks(projectedBooks)
        .projectedPages(projectedPages)
        .dailyPagesTarget(dailyPagesTarget)
        .dailyBooksTarget(dailyBooksTarget)
        .dailyInsight(insight)
        .build();
  }

  private String determinePace(int actual, double expected) {
    if (actual > expected + (expected * 0.1))
      return "AHEAD";
    if (actual < expected - (expected * 0.1))
      return "BEHIND";
    return "ON_TRACK";
  }
}
