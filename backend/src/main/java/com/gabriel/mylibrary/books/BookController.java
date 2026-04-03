package com.gabriel.mylibrary.books;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gabriel.mylibrary.books.dtos.BookDTO;
import com.gabriel.mylibrary.books.dtos.CreateBookDTO;
import com.gabriel.mylibrary.books.dtos.UpdateBookDTO;
import com.gabriel.mylibrary.common.enums.BookStatus;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
public class BookController {

  private final BookService bookService;

  @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<Page<BookDTO>> findAll(
      @AuthenticationPrincipal UserEntity user,
      @RequestParam(required = false) BookStatus status,
      @RequestParam(required = false) Integer minRating,
      @RequestParam(required = false) UUID categoryId,
      @RequestParam(required = false) String author,
      @RequestParam(required = false) Integer year,
      @PageableDefault(size = 10, sort = "title") Pageable pageable) {
    if (status == null && minRating == null && categoryId == null && author == null && year == null) {
      return ResponseEntity.ok(bookService.findAll(user.getId(), pageable));
    }
    return ResponseEntity
        .ok(bookService.findWithFilters(user.getId(), status, minRating, categoryId, author, year, pageable));
  }

  @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<Page<BookDTO>> findByTitle(
      @RequestParam String title,
      @AuthenticationPrincipal UserEntity user,
      @PageableDefault(size = 10, sort = "title") Pageable pageable) {
    return ResponseEntity.ok(bookService.findByTitle(title, user.getId(), pageable));
  }

  @GetMapping("/{id}")
  public ResponseEntity<BookDTO> findOne(
      @PathVariable UUID id,
      @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(bookService.findOne(id, user.getId()));
  }

  @PostMapping
  public ResponseEntity<BookDTO> create(
      @Valid @RequestBody CreateBookDTO dto,
      @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.status(HttpStatus.CREATED).body(bookService.create(dto, user.getId()));
  }

  @PatchMapping("/{id}")
  public ResponseEntity<BookDTO> update(
      @PathVariable UUID id,
      @Valid @RequestBody UpdateBookDTO dto,
      @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(bookService.update(id, user.getId(), dto));
  }

  @PostMapping("/{id}/reset")
  public ResponseEntity<BookDTO> resetForReread(
      @PathVariable UUID id,
      @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(bookService.resetForReread(id, user.getId()));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(
      @PathVariable UUID id,
      @AuthenticationPrincipal UserEntity user) {
    bookService.delete(id, user.getId());
    return ResponseEntity.noContent().build();
  }
}
