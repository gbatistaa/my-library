package com.gabriel.mylibrary.readingGoal;

import com.gabriel.mylibrary.readingGoal.dtos.CreateReadingGoalDTO;
import com.gabriel.mylibrary.readingGoal.dtos.ReadingGoalDTO;
import com.gabriel.mylibrary.readingGoal.dtos.ReadingGoalProgressDTO;
import com.gabriel.mylibrary.readingGoal.dtos.UpdateReadingGoalDTO;
import com.gabriel.mylibrary.user.UserEntity;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/reading-goals")
@RequiredArgsConstructor
public class ReadingGoalController {

  private final ReadingGoalService readingGoalService;

  @PostMapping
  public ResponseEntity<ReadingGoalDTO> create(
      @AuthenticationPrincipal UserEntity user,
      @Valid @RequestBody CreateReadingGoalDTO dto) {
    return ResponseEntity.status(HttpStatus.CREATED).body(readingGoalService.create(user.getId(), dto));
  }

  @GetMapping("/{year}")
  public ResponseEntity<ReadingGoalDTO> getGoal(
      @AuthenticationPrincipal UserEntity user,
      @PathVariable Integer year) {
    return ResponseEntity.ok(readingGoalService.getGoal(user.getId(), year));
  }

  @GetMapping("/{year}/progress")
  public ResponseEntity<ReadingGoalProgressDTO> getProgress(
      @AuthenticationPrincipal UserEntity user,
      @PathVariable Integer year) {
    return ResponseEntity.ok(readingGoalService.getProgress(user.getId(), year));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ReadingGoalDTO> update(
      @AuthenticationPrincipal UserEntity user,
      @PathVariable UUID id,
      @Valid @RequestBody UpdateReadingGoalDTO dto) {
    return ResponseEntity.ok(readingGoalService.update(id, user.getId(), dto));
  }
}
