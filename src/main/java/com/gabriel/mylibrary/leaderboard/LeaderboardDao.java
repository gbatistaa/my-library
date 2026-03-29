package com.gabriel.mylibrary.leaderboard;

import com.gabriel.mylibrary.leaderboard.dtos.LeaderboardEntryDTO;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class LeaderboardDao {

  private final EntityManager entityManager;

  @SuppressWarnings("unchecked")
  public List<LeaderboardEntryDTO> getPagesLeaderboard(LocalDateTime startDate, String metricType) {
    String jpql = "SELECT u.id, u.username, CAST(SUM(rs.pagesRead) AS long) " +
        "FROM ReadingSessionEntity rs " +
        "JOIN rs.user u " +
        "WHERE rs.createdAt >= :startDate " +
        "GROUP BY u.id, u.username " +
        "ORDER BY SUM(rs.pagesRead) DESC";

    Query query = entityManager.createQuery(jpql)
        .setParameter("startDate", startDate)
        .setMaxResults(100);

    return mapToDTOList(query.getResultList(), metricType);
  }

  @SuppressWarnings("unchecked")
  public List<LeaderboardEntryDTO> getBooksLeaderboard(LocalDate startDate, String metricType) {
    String jpql = "SELECT u.id, u.username, COUNT(b) " +
        "FROM BookEntity b " +
        "JOIN b.user u " +
        "WHERE b.status = 'COMPLETED' AND b.finishDate >= :startDate " +
        "GROUP BY u.id, u.username " +
        "ORDER BY COUNT(b) DESC";

    Query query = entityManager.createQuery(jpql)
        .setParameter("startDate", startDate)
        .setMaxResults(100);

    return mapToDTOList(query.getResultList(), metricType);
  }

  @SuppressWarnings("unchecked")
  public List<LeaderboardEntryDTO> getDurationLeaderboard(LocalDateTime startDate, String metricType) {
    String jpql = "SELECT u.id, u.username, CAST(SUM(rs.durationMinutes) AS long) " +
        "FROM ReadingSessionEntity rs " +
        "JOIN rs.user u " +
        "WHERE rs.createdAt >= :startDate " +
        "GROUP BY u.id, u.username " +
        "ORDER BY SUM(rs.durationMinutes) DESC";

    Query query = entityManager.createQuery(jpql)
        .setParameter("startDate", startDate)
        .setMaxResults(100);

    return mapToDTOList(query.getResultList(), metricType);
  }

  @SuppressWarnings("unchecked")
  public List<LeaderboardEntryDTO> getSessionsLeaderboard(LocalDateTime startDate, String metricType) {
    String jpql = "SELECT u.id, u.username, COUNT(rs) " +
        "FROM ReadingSessionEntity rs " +
        "JOIN rs.user u " +
        "WHERE rs.createdAt >= :startDate " +
        "GROUP BY u.id, u.username " +
        "ORDER BY COUNT(rs) DESC";

    Query query = entityManager.createQuery(jpql)
        .setParameter("startDate", startDate)
        .setMaxResults(100);

    return mapToDTOList(query.getResultList(), metricType);
  }

  @SuppressWarnings("unchecked")
  public List<LeaderboardEntryDTO> getStreaksLeaderboard(String metricType) {
    String jpql = "SELECT u.id, u.username, s.bestStreak " +
        "FROM StreakEntity s " +
        "JOIN s.user u " +
        "WHERE s.bestStreak > 0 " +
        "ORDER BY s.bestStreak DESC";

    Query query = entityManager.createQuery(jpql)
        .setMaxResults(100);

    return mapToDTOList(query.getResultList(), metricType);
  }

  private List<LeaderboardEntryDTO> mapToDTOList(List<Object[]> results, String metricType) {
    List<LeaderboardEntryDTO> dtos = new ArrayList<>();
    int rank = 1;
    for (Object[] row : results) {
      LeaderboardEntryDTO dto = LeaderboardEntryDTO.builder()
          .rank(rank++)
          .userId((UUID) row[0])
          .username((String) row[1])
          .score((Number) row[2])
          .metricType(metricType)
          .formattedScore(formatScore((Number) row[2], metricType))
          .build();
      dtos.add(dto);
    }
    return dtos;
  }

  private String formatScore(Number score, String metricType) {
    if (score == null)
      return "0";

    long value = score.longValue();
    return switch (metricType) {
      case "PAGES" -> String.format("%,d páginas", value);
      case "BOOKS" -> value + (value == 1 ? " livro" : " livros");
      case "DURATION" -> {
        long hours = value / 60;
        long minutes = value % 60;
        yield hours > 0 ? String.format("%dh %02dm", hours, minutes) : value + "m";
      }
      case "SESSIONS" -> String.format("%,d sessões", value);
      case "STREAK" -> value + " dias🔥";
      default -> String.valueOf(value);
    };
  }
}
