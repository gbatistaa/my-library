package com.gabriel.mylibrary.stats;

import com.gabriel.mylibrary.books.userBook.UserBookEntity;
import com.gabriel.mylibrary.books.userBook.UserBookRepository;
import com.gabriel.mylibrary.books.userBook.projections.UserBookReadingProjection;
import com.gabriel.mylibrary.common.enums.BookStatus;
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
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StatsService {

  private final UserBookRepository userBookRepository;
  private final ReadingSessionRepository readingSessionRepository;
  private final StreakRepository streakRepository;

  @Transactional(readOnly = true)
  public ReadingDnaDTO getDna(UUID userId) {
    long totalCompleted = userBookRepository.countByUserIdAndStatus(userId, BookStatus.COMPLETED);
    long totalBooks = userBookRepository.countByUserId(userId);
    long totalDropped = userBookRepository.countByUserIdAndStatus(userId, BookStatus.DROPPED);
    int totalPages = readingSessionRepository.sumAllPagesReadByUserId(userId);
    long totalMinutes = readingSessionRepository.sumAllDurationByUserId(userId);
    Double avgRating = userBookRepository.avgRatingByUserId(userId);
    double avgPagesPerSession = readingSessionRepository.avgPagesPerSessionByUserId(userId);
    double avgDuration = readingSessionRepository.avgDurationPerSessionByUserId(userId);

    double completionRate = totalBooks == 0 ? 0 : (double) totalCompleted / totalBooks * 100;
    double dropRate = totalBooks == 0 ? 0 : (double) totalDropped / totalBooks * 100;
    double avgVelocity = totalMinutes == 0 ? 0 : (double) totalPages / (totalMinutes / 60.0);

    List<Object[]> genreData = userBookRepository.countBooksByCategory(userId);
    long totalGenreBooks = genreData.stream().mapToLong(g -> (Long) g[1]).sum();
    List<GenreShareDTO> genreBreakdown = genreData.stream()
        .map(g -> new GenreShareDTO(
            (String) g[0],
            totalGenreBooks == 0 ? 0 : (double) (Long) g[1] / totalGenreBooks,
            (Long) g[1]))
        .toList();

    List<Object[]> authorData = userBookRepository.countBooksByAuthor(userId);
    String topAuthor = authorData.isEmpty() ? "Nenhum" : (String) authorData.get(0)[0];
    long uniqueAuthors = userBookRepository.countDistinctAuthorsByUserId(userId);

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

    Map<LocalDate, HeatmapDTO.DayActivityDTO> dayMap = new LinkedHashMap<>();
    LocalDate date = LocalDate.of(year, 1, 1);
    LocalDate end = LocalDate.of(year, 12, 31);
    while (!date.isAfter(end) && !date.isAfter(LocalDate.now())) {
      dayMap.put(date, new HeatmapDTO.DayActivityDTO(date, 0, 0));
      date = date.plusDays(1);
    }

    readingSessionRepository.findDailyAggregationByUserIdAndCreatedAtBetween(userId, startOfYear, endOfYear)
        .forEach(agg -> {
          HeatmapDTO.DayActivityDTO day = dayMap.get(agg.getSessionDate());
          if (day != null) {
            day.setPagesRead((int) agg.getTotalPages());
            day.setSessionCount((int) agg.getSessionCount());
          }
        });

    return HeatmapDTO.builder()
        .year(year)
        .days(new ArrayList<>(dayMap.values()))
        .build();
  }

  @Transactional(readOnly = true)
  public VelocityDTO getVelocity(UUID userId) {
    LocalDate today = LocalDate.now();

    List<VelocityDTO.WeeklyPagesDTO> weeklyHistory = new ArrayList<>();
    for (int i = 11; i >= 0; i--) {
      LocalDate weekStart = today.minusWeeks(i).with(java.time.DayOfWeek.MONDAY);
      LocalDate weekEnd = weekStart.plusDays(6);
      int pages = readingSessionRepository.sumPagesReadByUserIdAndCreatedAtBetween(
          userId, weekStart.atStartOfDay(), weekEnd.atTime(23, 59, 59));
      String label = weekStart.format(DateTimeFormatter.ofPattern("dd/MM"));
      weeklyHistory.add(new VelocityDTO.WeeklyPagesDTO(label, pages));
    }

    double currentWeeklyAvg = weeklyHistory.subList(8, 12).stream()
        .mapToInt(VelocityDTO.WeeklyPagesDTO::getPagesRead).average().orElse(0);
    double previousWeeklyAvg = weeklyHistory.subList(4, 8).stream()
        .mapToInt(VelocityDTO.WeeklyPagesDTO::getPagesRead).average().orElse(0);
    double trend = previousWeeklyAvg == 0 ? 0 : ((currentWeeklyAvg - previousWeeklyAvg) / previousWeeklyAvg) * 100;

    List<UserBookReadingProjection> readingBooks = userBookRepository.findReadingProjectionsByUserIdAndStatus(userId,
        BookStatus.READING);
    double avgPagesPerDay = Math.max(1, readingSessionRepository.avgPagesPerSessionByUserId(userId));

    List<VelocityDTO.BookProjectionDTO> projections = readingBooks.stream()
        .map(book -> {
          int pagesRemaining = book.pages() - readingSessionRepository.sumPagesReadByUserIdAndCreatedAtBetween(
              userId, book.createdAt(), LocalDateTime.now());
          pagesRemaining = Math.max(0, pagesRemaining);
          int daysNeeded = (int) Math.ceil(pagesRemaining / avgPagesPerDay);
          LocalDate projected = today.plusDays(daysNeeded);
          return new VelocityDTO.BookProjectionDTO(
              book.title(), pagesRemaining,
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

  @Transactional(readOnly = true)
  public YearInReviewDTO getYearInReview(UUID userId, int year) {
    LocalDate startOfYear = LocalDate.of(year, 1, 1);
    LocalDate endOfYear = LocalDate.of(year, 12, 31);
    LocalDateTime startTime = startOfYear.atStartOfDay();
    LocalDateTime endTime = endOfYear.atTime(23, 59, 59);

    List<UserBookEntity> completedBooks = userBookRepository
        .findCompletedByUserIdAndFinishDateBetween(userId, startOfYear, endOfYear);
    int booksRead = completedBooks.size();
    int pagesRead = readingSessionRepository.sumPagesReadByUserIdAndCreatedAtBetween(userId, startTime, endTime);

    String pagesEquiv = "equivalente a ler Senhor dos Anéis " + String.format("%.1f", pagesRead / 1178.0) + " vezes";

    long readingDays = readingSessionRepository.countDistinctReadingDaysByUserIdAndCreatedAtBetween(userId, startTime,
        endTime);
    long totalMinutes = readingSessionRepository.sumDurationByUserIdAndCreatedAtBetween(userId, startTime, endTime);

    String fastestBook = completedBooks.stream()
        .filter(ub -> ub.getStartDate() != null && ub.getFinishDate() != null)
        .min(Comparator.comparingLong(ub -> ChronoUnit.DAYS.between(ub.getStartDate(), ub.getFinishDate())))
        .map(ub -> ub.getBook().getTitle() + " ("
            + ChronoUnit.DAYS.between(ub.getStartDate(), ub.getFinishDate()) + " dias)")
        .orElse("N/A");

    String longestBook = completedBooks.stream()
        .max(Comparator.comparingInt(ub -> ub.getBook().getPages()))
        .map(ub -> ub.getBook().getTitle() + " (" + ub.getBook().getPages() + " páginas)")
        .orElse("N/A");

    String highestRated = completedBooks.stream()
        .filter(ub -> ub.getRating() != null)
        .max(Comparator.comparingInt(UserBookEntity::getRating))
        .map(ub -> ub.getBook().getTitle() + " (" + ub.getRating() + "★)")
        .orElse("N/A");

    List<Object[]> genreRatings = userBookRepository.avgRatingByCategory(userId);
    String mostRereadable = genreRatings.isEmpty() ? "N/A" : (String) genreRatings.get(0)[0];

    var dailyAgg = readingSessionRepository.findDailyAggregationByUserIdAndCreatedAtBetween(userId, startTime, endTime);
    var bestDayAgg = dailyAgg.stream()
        .max(Comparator.comparingLong(com.gabriel.mylibrary.analytics.dtos.DailySessionAggDTO::getTotalPages))
        .orElse(null);
    LocalDate bestDay = bestDayAgg != null ? bestDayAgg.getSessionDate() : null;
    int bestDayPages = bestDayAgg != null ? (int) bestDayAgg.getTotalPages() : 0;

    int longestStreak = streakRepository.findByUserId(userId)
        .map(StreakEntity::getBestStreak)
        .orElse(0);

    Integer booksVsPrevious = null;
    String growthInsight = null;
    int prevYear = year - 1;
    LocalDate prevStart = LocalDate.of(prevYear, 1, 1);
    LocalDate prevEnd = LocalDate.of(prevYear, 12, 31);
    int prevBooks = userBookRepository.countByUserIdAndStatusAndFinishDateBetween(userId, BookStatus.COMPLETED,
        prevStart, prevEnd);
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
        .bestReadingDay(bestDay)
        .bestDayPages(bestDayPages)
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
