package com.gabriel.mylibrary.saga;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gabriel.mylibrary.books.dtos.BookDTO;
import com.gabriel.mylibrary.saga.dtos.CreateSagaDTO;
import com.gabriel.mylibrary.saga.dtos.SagaDTO;
import com.gabriel.mylibrary.saga.dtos.UpdateSagaDTO;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/sagas")
@RequiredArgsConstructor
public class SagaController {

  private final SagaService sagaService;

  @GetMapping
  public ResponseEntity<List<SagaDTO>> findAll(@AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(sagaService.findAllByUserId(user.getId()));
  }

  @GetMapping("/{id}")
  public ResponseEntity<SagaDTO> findOne(@PathVariable UUID id, @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(sagaService.findOne(id, user.getId()));
  }

  @GetMapping("/{id}/books")
  public ResponseEntity<List<BookDTO>> getBooks(@PathVariable UUID id, @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(sagaService.getBooks(id, user.getId()));
  }

  @GetMapping("/{id}/progress")
  public ResponseEntity<Double> getProgress(@PathVariable UUID id, @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(sagaService.getProgress(id, user.getId()));
  }

  @PostMapping
  public ResponseEntity<SagaDTO> create(
      @Valid @RequestBody CreateSagaDTO dto,
      @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.status(HttpStatus.CREATED).body(sagaService.create(user.getId(), dto));
  }

  @PutMapping("/{id}")
  public ResponseEntity<SagaDTO> update(
      @PathVariable UUID id,
      @Valid @RequestBody UpdateSagaDTO dto,
      @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(sagaService.update(id, dto, user.getId()));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable UUID id, @AuthenticationPrincipal UserEntity user) {
    sagaService.delete(id, user.getId());
    return ResponseEntity.noContent().build();
  }

  @PatchMapping("/{id}/books/{bookId}")
  public ResponseEntity<SagaDTO> addBookToSaga(
      @PathVariable UUID id,
      @PathVariable UUID bookId,
      @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(sagaService.addBookToSaga(id, bookId, user.getId()));
  }

  @DeleteMapping("/{id}/books/{bookId}")
  public ResponseEntity<Void> removeBookFromSaga(
      @PathVariable UUID id,
      @PathVariable UUID bookId,
      @AuthenticationPrincipal UserEntity user) {
    sagaService.removeBookFromSaga(id, bookId, user.getId());
    return ResponseEntity.noContent().build();
  }
}
