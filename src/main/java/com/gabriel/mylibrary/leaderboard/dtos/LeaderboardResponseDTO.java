package com.gabriel.mylibrary.leaderboard.dtos;

import com.gabriel.mylibrary.leaderboard.enums.LeaderboardMetric;
import com.gabriel.mylibrary.leaderboard.enums.LeaderboardPeriod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardResponseDTO {
  private LeaderboardMetric metric;
  private LeaderboardPeriod period;
  private List<LeaderboardEntryDTO> entries;
}
