package com.gabriel.mylibrary.stats;

import com.gabriel.mylibrary.books.BookEntity;
import com.gabriel.mylibrary.books.BookRepository;
import com.gabriel.mylibrary.common.enums.BookStatus;
import com.gabriel.mylibrary.readingSession.ReadingSessionEntity;
import com.gabriel.mylibrary.readingSession.ReadingSessionRepository;
import com.gabriel.mylibrary.stats.dtos.*;
import com.gabriel.mylibrary.streak.StreakEntity;
import com.gabriel.mylibrary.streak.StreakRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class StatsService {

  private final BookRepository bookRepository;
  private final ReadingSessionRepository readingSessionRepository;
  private final StreakRepository streakRepository;

  @Transactional(readOnly = true)
  public ReadingDnaDTO getDna(UUID userId) {
    long totalCompleted = bookRepository.countByUserIdAndStatus(userId, BookStatus.COMPLETED);
    long totalBooks = bookRepository.countByUserId(userId);
    long totalDropped = bookRepository.countByUserIdAndStatus(userId, BookStatus.DROPPED);
    int totalPages = readingSessionRepository.sumAllPagesReadByUserId(userId);
    long totalMinutes = readingSessionRepository.sumAllDurationByUserId(userId);
    Double avgRating = bookRepository.avgRatingByUserId(userId);
    double avgPagesPerSession = readingSessionRepository.avgPagesPerSessionByUserId(userId);
    double avgDuration = readingSessionRepository.avgDurationPerSessionByUserId(userId);

    double completionRate = totalBooks == 0 ? 0 : (double) totalCompleted / totalBooks * 100;
    double dropRate = totalBooks == 0 ? 0 : (double) totalDropped / totalBooks * 100;
    double avgVelocity = totalMinutes == 0 ? 0 : (double) totalPages / (totalMinutes / 60.0);

    // Genre breakdown
    List<Object[]> genreData = bookRepository.countBooksByCategory(userId);
    long totalGenreBooks = genreData.stream().mapToLong(g -> (Long) g[1]).sum();
    List<GenreShareDTO> genreBreakdown = genreData.stream()
        .map(g -> new GenreShareDTO(
            (String) g[0],
            totalGenreBooks == 0 ? 0 : (double) (Long) g[1] / totalGenreBooks,
            (Long) g[1]))
        .toList();

    // Top author
    List<Object[]> authorData = bookRepository.countBooksByAuthor(userId);
    String topAuthor = authorData.isEmpty() ? "Nenhum" : (String) authorData.get(0)[0];
    long uniqueAuthors = bookRepository.countDistinctAuthorsByUserId(userId);

    // Reader Archetype
    String archetype = determineArchetype(avgDuration, uniqueAuthors, genreBreakdown.size(), totalCompleted);

    return ReadingDnaDTO.builder()
        .totalBooksLifetime((int) totalCompleted)
        .totalPagesLifetime(totalPages)
        .avgRating(avgRating != null ? avgRating : 0.0)
        .completionRate(completionRate)
        .avgVelocityPagesPerHour(avgVelocity)
        .avgSessionDurationMin(avgDuration)
        .avgPagesPerSession((int) avgPagesPerSession)
        .genreBreakdown(genreBreakdown)
        .topAuthor(topAuthor)
        .uniqueAuthorsRead((int) uniqueAuthors)
        .dropRate(dropRate)
        .readerArchetype(archetype)
        .build();
  }

  @Transactional(readOnly = true)
  public HeatmapDTO getHeatmap(UUID userId, int year) {
    LocalDateTime startOfYear = LocalDate.of(year, 1, 1).atStartOfDay();
    LocalDateTime endOfYear = LocalDate.of(year, 12, 31).atTime(23, 59, 59);

    List<ReadingSessionEntity> sessions = readingSessionRepository.findAllByUserId(userId).stream()
        .filter(s -> s.getCreatedAt() != null
            && !s.getCreatedAt().isBefore(startOfYear)
            && !s.getCreatedAt().isAfter(endOfYear))
        .toList();

    Map<LocalDate, HeatmapDTO.DayActivityDTO> dayMap = new LinkedHashMap<>();
    LocalDate date = LocalDate.of(year, 1, 1);
    LocalDate end = LocalDate.of(year, 12, 31);
    while (!date.isAfter(end) && !date.isAfter(LocalDate.now())) {
      dayMap.put(date, new HeatmapDTO.DayActivityDTO(date, 0, 0));
      date = date.plusDays(1);
    }

    for (ReadingSessionEntity session : sessions) {
      LocalDate sessionDate = session.getCreatedAt().toLocalDate();
      HeatmapDTO.DayActivityDTO day = dayMap.get(sessionDate);
      if (day != null) {
        day.setPagesRead(day.getPagesRead() + session.getPagesRead());
        day.setSessionCount(day.getSessionCount() + 1);
      }
    }

    return HeatmapDTO.builder()
        .year(year)
        .days(new ArrayList<>(dayMap.values()))
        .build();
  }

  @Transactional(readOnly = true)
  public VelocityDTO getVelocity(UUID userId) {
    LocalDate today = LocalDate.now();

    // Weekly history (last 12 weeks)
    List<VelocityDTO.WeeklyPagesDTO> weeklyHistory = new ArrayList<>();
    for (int i = 11; i >= 0; i--) {
      LocalDate weekStart = today.minusWeeks(i).with(java.time.DayOfWeek.MONDAY);
      LocalDate weekEnd = weekStart.plusDays(6);
      int pages = readingSessionRepository.sumPagesReadByUserIdAndCreatedAtBetween(
          userId, weekStart.atStartOfDay(), weekEnd.atTime(23, 59, 59));
      String label = weekStart.format(DateTimeFormatter.ofPattern("dd/MM"));
      weeklyHistory.add(new VelocityDTO.WeeklyPagesDTO(label, pages));
    }

    // Trend calculation
    double currentWeeklyAvg = weeklyHistory.subList(8, 12).stream()
        .mapToInt(VelocityDTO.WeeklyPagesDTO::getPagesRead).average().orElse(0);
    double previousWeeklyAvg = weeklyHistory.subList(4, 8).stream()
        .mapToInt(VelocityDTO.WeeklyPagesDTO::getPagesRead).average().orElse(0);
    double trend = previousWeeklyAvg == 0 ? 0 : ((currentWeeklyAvg - previousWeeklyAvg) / previousWeeklyAvg) * 100;

    // Active book projections
    List<BookEntity> readingBooks = bookRepository.findAllByUserIdAndStatus(userId, BookStatus.READING);
    double avgPagesPerDay = Math.max(1, readingSessionRepository.avgPagesPerSessionByUserId(userId));

    List<VelocityDTO.BookProjectionDTO> projections = readingBooks.stream()
        .map(book -> {
          int pagesRemaining = book.getPages() - readingSessionRepository.sumPagesReadByUserIdAndCreatedAtBetween(
              userId, book.getCreatedAt(), LocalDateTime.now());
          pagesRemaining = Math.max(0, pagesRemaining);
          int daysNeeded = (int) Math.ceil(pagesRemaining / avgPagesPerDay);
          LocalDate projected = today.plusDays(daysNeeded);
          return new VelocityDTO.BookProjectionDTO(
              book.getTitle(), pagesRemaining,
              projected.format(DateTimeFormatter.ofPattern("dd 'de' MMMM")));
        })
        .toList();

    return VelocityDTO.builder()
        .currentWeeklyPagesAvg(currentWeeklyAvg)
        .previousWeeklyPagesAvg(previousWeeklyAvg)
        .velocityTrend(trend)
        .activeBookProjections(projections)
        .weeklyHistory(weeklyHistory)
        .build();
  }

  @SuppressWarnings("null")
  @Transactional(readOnly = true)
  public YearInReviewDTO getYearInReview(UUID userId, int year) {
    LocalDate startOfYear = LocalDate.of(year, 1, 1);
    LocalDate endOfYear = LocalDate.of(year, 12, 31);
    LocalDateTime startTime = startOfYear.atStartOfDay();
    LocalDateTime endTime = endOfYear.atTime(23, 59, 59);

    List<BookEntity> completedBooks = bookRepository.findCompletedByUserIdAndFinishDateBetween(userId, startOfYear,
        endOfYear);
    int booksRead = completedBooks.size();
    int pagesRead = readingSessionRepository.sumPagesReadByUserIdAndCreatedAtBetween(userId, startTime, endTime);

    // Pages equivalent (Lord of the Rings = ~1178 pages)
    String pagesEquiv = "equivalente a ler Senhor dos Anéis " + String.format("%.1f", pagesRead / 1178.0) + " vezes";

    // Reading days from heatmap
    List<ReadingSessionEntity> yearSessions = readingSessionRepository.findAllByUserId(userId).stream()
        .filter(s -> s.getCreatedAt() != null && !s.getCreatedAt().isBefore(startTime)
            && !s.getCreatedAt().isAfter(endTime))
        .toList();
    long readingDays = yearSessions.stream()
        .map(s -> s.getCreatedAt().toLocalDate())
        .distinct()
        .count();
    long totalMinutes = yearSessions.stream().mapToLong(ReadingSessionEntity::getDurationSeconds).sum();

    // Fastest book
    String fastestBook = completedBooks.stream()
        .filter(b -> b.getStartDate() != null && b.getFinishDate() != null)
        .min(Comparator.comparingLong(b -> ChronoUnit.DAYS.between(b.getStartDate(), b.getFinishDate())))
        .map(b -> b.getTitle() + " (" + ChronoUnit.DAYS.between(b.getStartDate(), b.getFinishDate()) + " dias)")
        .orElse("N/A");

    // Longest book
    String longestBook = completedBooks.stream()
        .max(Comparator.comparingInt(BookEntity::getPages))
        .map(b -> b.getTitle() + " (" + b.getPages() + " páginas)")
        .orElse("N/A");

    // Highest rated
    String highestRated = completedBooks.stream()
        .filter(b -> b.getRating() != null)
        .max(Comparator.comparingInt(BookEntity::getRating))
        .map(b -> b.getTitle() + " (" + b.getRating() + "★)")
        .orElse("N/A");

    // Most rereadable genre (highest avg rating)
    List<Object[]> genreRatings = bookRepository.avgRatingByCategory(userId);
    String mostRereadable = genreRatings.isEmpty() ? "N/A" : (String) genreRatings.get(0)[0];

    // Best reading day
    Map<LocalDate, Integer> dailyPages = new HashMap<>();
    for (ReadingSessionEntity session : yearSessions) {
      LocalDate day = session.getCreatedAt().toLocalDate();
      dailyPages.merge(day, session.getPagesRead(), Integer::sum);
    }
    Map.Entry<LocalDate, Integer> bestDay = dailyPages.entrySet().stream()
        .max(Map.Entry.comparingByValue())
        .orElse(null);

    // Longest streak
    int longestStreak = streakRepository.findByUserId(userId)
        .map(StreakEntity::getBestStreak)
        .orElse(0);

    // YoY comparison
    Integer booksVsPrevious = null;
    String growthInsight = null;
    int prevYear = year - 1;
    LocalDate prevStart = LocalDate.of(prevYear, 1, 1);
    LocalDate prevEnd = LocalDate.of(prevYear, 12, 31);
    int prevBooks = bookRepository.countByUserIdAndStatusAndFinishDateBetween(userId, BookStatus.COMPLETED, prevStart,
        prevEnd);
    if (prevBooks > 0) {
      booksVsPrevious = booksRead - prevBooks;
      if (booksVsPrevious > 0) {
        growthInsight = "📈 Você leu " + booksVsPrevious + " livros a mais que em " + prevYear + "!";
      } else if (booksVsPrevious < 0) {
        growthInsight = "📉 " + Math.abs(booksVsPrevious) + " livros a menos que " + prevYear
            + ". Ano que vem será diferente!";
      } else {
        growthInsight = "🔄 Mesmo ritmo de " + prevYear + ". Consistência é poder!";
      }
    }

    return YearInReviewDTO.builder()
        .year(year)
        .booksRead(booksRead)
        .pagesRead(pagesRead)
        .pagesEquivalent(pagesEquiv)
        .readingDays((int) readingDays)
        .totalMinutesRead(totalMinutes)
        .fastestBook(fastestBook)
        .longestBook(longestBook)
        .highestRatedBook(highestRated)
        .mostRereadableGenre(mostRereadable)
        .bestReadingDay(bestDay != null ? bestDay.getKey() : null)
        .bestDayPages(bestDay != null ? bestDay.getValue() : 0)
        .longestStreak(longestStreak)
        .booksVsPreviousYear(booksVsPrevious)
        .growthInsight(growthInsight)
        .build();
  }

  private String determineArchetype(double avgDuration, long uniqueAuthors, int genreCount, long totalBooks) {
    if (avgDuration >= 90 && totalBooks >= 20)
      return "Devorador Noturno";
    if (genreCount >= 6)
      return "Explorador de Gêneros";
    if (uniqueAuthors >= 15)
      return "Caçador de Vozes";
    if (totalBooks >= 50)
      return "Leitor Implacável";
    if (avgDuration >= 60)
      return "Leitor Intenso";
    if (totalBooks >= 10)
      return "Leitor Consistente";
    return "Leitor em Ascensão";
  }
}
