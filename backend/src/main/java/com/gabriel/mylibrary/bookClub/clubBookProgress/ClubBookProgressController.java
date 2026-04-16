package com.gabriel.mylibrary.bookClub.clubBookProgress;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gabriel.mylibrary.bookClub.clubBookProgress.dtos.ClubBookProgressDTO;
import com.gabriel.mylibrary.bookClub.clubBookProgress.dtos.UpdateClubBookProgressDTO;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/book-clubs/{clubId}/books/{clubBookId}/progress")
@RequiredArgsConstructor
public class ClubBookProgressController {

  private final ClubBookProgressService clubBookProgressService;

  /**
   * List progress for all members of a club book.
   * Any active club member can call this.
   */
  @GetMapping
  public ResponseEntity<List<ClubBookProgressDTO>> listProgress(
      @PathVariable UUID clubId,
      @PathVariable UUID clubBookId,
      @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(
        clubBookProgressService.listProgressForClubBook(clubId, clubBookId, user.getId()));
  }

  /**
   * Get the authenticated user's own progress for a club book.
   */
  @GetMapping("/me")
  public ResponseEntity<ClubBookProgressDTO> getMyProgress(
      @PathVariable UUID clubId,
      @PathVariable UUID clubBookId,
      @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(
        clubBookProgressService.getMyProgress(clubId, clubBookId, user.getId()));
  }

  /**
   * Update the authenticated user's own progress for a club book.
   * Only allowed while the book is active (isCurrent = true).
   */
  @PatchMapping("/me")
  public ResponseEntity<ClubBookProgressDTO> updateMyProgress(
      @PathVariable UUID clubId,
      @PathVariable UUID clubBookId,
      @RequestBody @Valid UpdateClubBookProgressDTO dto,
      @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(
        clubBookProgressService.updateMyProgress(clubId, clubBookId, dto, user.getId()));
  }
}
