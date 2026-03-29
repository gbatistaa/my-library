package com.gabriel.mylibrary.leaderboard.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardEntryDTO {
  private int rank;
  private UUID userId;
  private String username;
  private Number score; // Generic to handle Integer (pages/books) and Long (duration)
  private String formattedScore; // Frontend ready representation, e.g. "72h 30m" or "1.500"
  private String metricType; // pages, books, duration, sessions, streak
}
