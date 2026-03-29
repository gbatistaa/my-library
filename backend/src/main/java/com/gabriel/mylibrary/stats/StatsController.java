package com.gabriel.mylibrary.stats;

import com.gabriel.mylibrary.stats.dtos.*;
import com.gabriel.mylibrary.user.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stats")
@RequiredArgsConstructor
public class StatsController {

  private final StatsService statsService;

  @GetMapping("/dna")
  public ResponseEntity<ReadingDnaDTO> getDna(@AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(statsService.getDna(user.getId()));
  }

  @GetMapping("/heatmap")
  public ResponseEntity<HeatmapDTO> getHeatmap(
      @AuthenticationPrincipal UserEntity user,
      @RequestParam int year) {
    return ResponseEntity.ok(statsService.getHeatmap(user.getId(), year));
  }

  @GetMapping("/velocity")
  public ResponseEntity<VelocityDTO> getVelocity(@AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(statsService.getVelocity(user.getId()));
  }

  @GetMapping("/year-in-review")
  public ResponseEntity<YearInReviewDTO> getYearInReview(
      @AuthenticationPrincipal UserEntity user,
      @RequestParam int year) {
    return ResponseEntity.ok(statsService.getYearInReview(user.getId(), year));
  }
}
