package com.gabriel.mylibrary.streak;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class StreakWorker {

  private final StreakService streakService;

  @Scheduled(cron = "0 0 0 * * *")
  public void resetStreak() {
    streakService.resetStreak();
  }
}
