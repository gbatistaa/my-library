package com.gabriel.mylibrary.bookClub.clubBookReview;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gabriel.mylibrary.bookClub.clubBookReview.dtos.ClubBookReviewDTO;
import com.gabriel.mylibrary.bookClub.clubBookReview.dtos.CreateClubBookReviewDTO;
import com.gabriel.mylibrary.bookClub.clubBookReview.dtos.UpdateClubBookReviewDTO;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/book-clubs/{clubId}/books/{clubBookId}/reviews")
@RequiredArgsConstructor
public class ClubBookReviewController {

  private final ClubBookReviewService reviewService;

  @PostMapping
  public ResponseEntity<ClubBookReviewDTO> create(
      @PathVariable UUID clubId,
      @PathVariable UUID clubBookId,
      @RequestBody @Valid CreateClubBookReviewDTO dto,
      @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.status(201)
        .body(reviewService.create(clubId, clubBookId, dto, user.getId()));
  }

  @GetMapping
  public ResponseEntity<List<ClubBookReviewDTO>> list(
      @PathVariable UUID clubId,
      @PathVariable UUID clubBookId,
      @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(reviewService.listByClubBook(clubId, clubBookId, user.getId()));
  }

  @PatchMapping("/{reviewId}")
  public ResponseEntity<ClubBookReviewDTO> update(
      @PathVariable UUID clubId,
      @PathVariable UUID clubBookId,
      @PathVariable UUID reviewId,
      @RequestBody @Valid UpdateClubBookReviewDTO dto,
      @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(reviewService.update(clubId, clubBookId, reviewId, dto, user.getId()));
  }

  @DeleteMapping("/{reviewId}")
  public ResponseEntity<Void> delete(
      @PathVariable UUID clubId,
      @PathVariable UUID clubBookId,
      @PathVariable UUID reviewId,
      @AuthenticationPrincipal UserEntity user) {
    reviewService.delete(clubId, clubBookId, reviewId, user.getId());
    return ResponseEntity.noContent().build();
  }
}
