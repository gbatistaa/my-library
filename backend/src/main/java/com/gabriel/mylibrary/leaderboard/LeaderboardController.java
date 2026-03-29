package com.gabriel.mylibrary.leaderboard;

import com.gabriel.mylibrary.leaderboard.dtos.LeaderboardResponseDTO;
import com.gabriel.mylibrary.leaderboard.enums.LeaderboardMetric;
import com.gabriel.mylibrary.leaderboard.enums.LeaderboardPeriod;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

  private final LeaderboardService leaderboardService;

  @GetMapping("/pages")
  public ResponseEntity<LeaderboardResponseDTO> getPages(
      @RequestParam(defaultValue = "ALL_TIME") LeaderboardPeriod period) {
    return ResponseEntity.ok(leaderboardService.getLeaderboard(LeaderboardMetric.PAGES, period));
  }

  @GetMapping("/books")
  public ResponseEntity<LeaderboardResponseDTO> getBooks(
      @RequestParam(defaultValue = "ALL_TIME") LeaderboardPeriod period) {
    return ResponseEntity.ok(leaderboardService.getLeaderboard(LeaderboardMetric.BOOKS, period));
  }

  @GetMapping("/duration")
  public ResponseEntity<LeaderboardResponseDTO> getDuration(
      @RequestParam(defaultValue = "ALL_TIME") LeaderboardPeriod period) {
    return ResponseEntity.ok(leaderboardService.getLeaderboard(LeaderboardMetric.DURATION, period));
  }

  @GetMapping("/sessions")
  public ResponseEntity<LeaderboardResponseDTO> getSessions(
      @RequestParam(defaultValue = "ALL_TIME") LeaderboardPeriod period) {
    return ResponseEntity.ok(leaderboardService.getLeaderboard(LeaderboardMetric.SESSIONS, period));
  }

  @GetMapping("/streaks")
  public ResponseEntity<LeaderboardResponseDTO> getStreaks() {
    return ResponseEntity.ok(leaderboardService.getLeaderboard(LeaderboardMetric.STREAK, LeaderboardPeriod.ALL_TIME));
  }
}
