package com.gabriel.mylibrary.achievement;

import com.gabriel.mylibrary.user.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/achievements")
@RequiredArgsConstructor
public class AchievementController {

  private final AchievementService achievementService;

  @GetMapping
  public ResponseEntity<List<AchievementDTO>> getAll(@AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(achievementService.getAllWithProgress(user.getId()));
  }

  @GetMapping("/recent")
  public ResponseEntity<List<AchievementDTO>> getRecent(@AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(achievementService.getRecent(user.getId()));
  }
}
