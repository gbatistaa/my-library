package com.gabriel.mylibrary.leaderboard;

import com.gabriel.mylibrary.leaderboard.dtos.LeaderboardResponseDTO;
import com.gabriel.mylibrary.leaderboard.enums.LeaderboardMetric;
import com.gabriel.mylibrary.leaderboard.enums.LeaderboardPeriod;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

  private final LeaderboardDao leaderboardDao;

  @Transactional(readOnly = true)
  public LeaderboardResponseDTO getLeaderboard(LeaderboardMetric metric, LeaderboardPeriod period) {
    LocalDateTime startDate = getStartDateFromPeriod(period);

    var entries = switch (metric) {
      case PAGES -> leaderboardDao.getPagesLeaderboard(startDate, metric.name());
      case BOOKS -> leaderboardDao.getBooksLeaderboard(startDate, metric.name());
      case DURATION -> leaderboardDao.getDurationLeaderboard(startDate, metric.name());
      case SESSIONS -> leaderboardDao.getSessionsLeaderboard(startDate, metric.name());
      case STREAK -> leaderboardDao.getStreaksLeaderboard(metric.name());
    };

    return LeaderboardResponseDTO.builder()
        .metric(metric)
        .period(period)
        .entries(entries)
        .build();
  }

  private LocalDateTime getStartDateFromPeriod(LeaderboardPeriod period) {
    LocalDate now = LocalDate.now();
    return switch (period) {
      case WEEK -> now.minusDays(7).atStartOfDay();
      case MONTH -> now.minusDays(30).atStartOfDay();
      case ALL_TIME -> LocalDateTime.of(2000, 1, 1, 0, 0);
    };
  }
}
