package com.gabriel.mylibrary.streak;

import com.gabriel.mylibrary.user.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/streak")
@RequiredArgsConstructor
public class StreakController {

  private final StreakService streakService;

  @GetMapping
  public ResponseEntity<StreakDTO> getStreak(@AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(streakService.getStreak(user.getId()));
  }
}
