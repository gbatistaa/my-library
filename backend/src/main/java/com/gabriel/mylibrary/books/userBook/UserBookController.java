package com.gabriel.mylibrary.books.userBook;

import java.util.List;
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

import com.gabriel.mylibrary.books.dtos.BookAuthorDTO;
import com.gabriel.mylibrary.books.userBook.dtos.AddToLibraryDTO;
import com.gabriel.mylibrary.books.userBook.dtos.UpdateUserBookDTO;
import com.gabriel.mylibrary.books.userBook.dtos.UserBookDTO;
import com.gabriel.mylibrary.books.userBook.projections.UserBookSummary;
import com.gabriel.mylibrary.common.enums.BookStatus;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/user-books")
@RequiredArgsConstructor
public class UserBookController {

  private final UserBookService userBookService;

  @GetMapping(value = "/authors", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<List<BookAuthorDTO>> getAuthors(@AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(userBookService.getAuthors(user.getId()));
  }

  @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> findAll(
      @AuthenticationPrincipal UserEntity user,
      @RequestParam(required = false) BookStatus status,
      @RequestParam(required = false) Integer minRating,
      @RequestParam(required = false) String category,
      @RequestParam(required = false) String author,
      @RequestParam(required = false) Integer year,
      @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
    boolean noFilters = status == null && minRating == null
        && (category == null || category.isBlank())
        && (author == null || author.isBlank())
        && year == null;
    if (noFilters) {
      Page<UserBookSummary> summaries = userBookService.findAll(user.getId(), pageable);
      return ResponseEntity.ok(summaries);
    }
    Page<UserBookDTO> filtered = userBookService.findWithFilters(user.getId(), status, minRating, category, author,
        year, pageable);
    return ResponseEntity.ok(filtered);
  }

  @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<Page<UserBookSummary>> findByTitle(
      @RequestParam String title,
      @AuthenticationPrincipal UserEntity user,
      @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
    return ResponseEntity.ok(userBookService.findByTitle(title, user.getId(), pageable));
  }

  @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<UserBookDTO> findOne(
      @PathVariable UUID id,
      @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(userBookService.findOne(id, user.getId()));
  }

  @PostMapping
  public ResponseEntity<UserBookDTO> addToLibrary(
      @Valid @RequestBody AddToLibraryDTO dto,
      @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.status(HttpStatus.CREATED).body(userBookService.addToLibrary(dto, user.getId()));
  }

  @PatchMapping("/{id}")
  public ResponseEntity<UserBookDTO> update(
      @PathVariable UUID id,
      @Valid @RequestBody UpdateUserBookDTO dto,
      @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(userBookService.updateUserState(id, user.getId(), dto));
  }

  @PostMapping("/{id}/reset")
  public ResponseEntity<UserBookDTO> resetForReread(
      @PathVariable UUID id,
      @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(userBookService.resetForReread(id, user.getId()));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> remove(
      @PathVariable UUID id,
      @AuthenticationPrincipal UserEntity user) {
    userBookService.removeFromLibrary(id, user.getId());
    return ResponseEntity.noContent().build();
  }
}
