package com.gabriel.mylibrary.readingSession;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gabriel.mylibrary.readingSession.dtos.CreateReadingSessionDTO;
import com.gabriel.mylibrary.readingSession.dtos.ReadingSessionDTO;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/reading-sessions")
@RequiredArgsConstructor
public class ReadingSessionController {

  private final ReadingSessionService readingSessionService;

  @GetMapping
  public ResponseEntity<List<ReadingSessionDTO>> findAll(
      @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(readingSessionService.findAll(user.getId()));
  }

  @GetMapping("/history")
  public ResponseEntity<org.springframework.data.domain.Page<ReadingSessionDTO>> getHistory(
      @AuthenticationPrincipal UserEntity user,
      org.springframework.data.domain.Pageable pageable) {
    return ResponseEntity.ok(readingSessionService.getHistory(user.getId(), pageable));
  }

  @GetMapping("/book/{bookId}")
  public ResponseEntity<List<ReadingSessionDTO>> findAllByBook(
      @PathVariable UUID bookId,
      @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(readingSessionService.findAllByBook(bookId, user.getId()));
  }

  @PostMapping
  public ResponseEntity<ReadingSessionDTO> create(
      @AuthenticationPrincipal UserEntity user,
      @Valid @RequestBody CreateReadingSessionDTO dto) {
    return ResponseEntity.status(HttpStatus.CREATED).body(readingSessionService.create(user.getId(), dto));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(
      @PathVariable UUID id,
      @AuthenticationPrincipal UserEntity user) {
    readingSessionService.delete(id, user.getId());
    return ResponseEntity.noContent().build();
  }
}
