package com.gabriel.mylibrary.bookClub.clubBook;

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

import com.gabriel.mylibrary.bookClub.clubBook.dtos.AddClubBookDTO;
import com.gabriel.mylibrary.bookClub.clubBook.dtos.ClubBookDTO;
import com.gabriel.mylibrary.bookClub.clubBook.dtos.UpdateClubBookDTO;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/book-clubs/{clubId}/books")
@RequiredArgsConstructor
public class ClubBookController {

  private final ClubBookService clubBookService;

  @PostMapping
  public ResponseEntity<ClubBookDTO> add(@PathVariable UUID clubId,
      @RequestBody @Valid AddClubBookDTO dto,
      @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.status(201).body(clubBookService.addBookToClub(clubId, dto, user.getId()));
  }

  @GetMapping
  public ResponseEntity<List<ClubBookDTO>> list(@PathVariable UUID clubId,
      @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(clubBookService.listBooksForClub(clubId, user.getId()));
  }

  @PatchMapping("/{id}")
  public ResponseEntity<ClubBookDTO> update(@PathVariable UUID clubId,
      @PathVariable UUID id,
      @RequestBody @Valid UpdateClubBookDTO dto,
      @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(clubBookService.updateClubBook(clubId, id, dto, user.getId()));
  }

  @PostMapping("/{id}/current")
  public ResponseEntity<ClubBookDTO> setCurrent(@PathVariable UUID clubId,
      @PathVariable UUID id,
      @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(clubBookService.setCurrent(clubId, id, user.getId()));
  }

  @PostMapping("/advance")
  public ResponseEntity<ClubBookDTO> advance(@PathVariable UUID clubId,
      @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(clubBookService.advanceToNextBook(clubId, user.getId()));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> remove(@PathVariable UUID clubId,
      @PathVariable UUID id,
      @AuthenticationPrincipal UserEntity user) {
    clubBookService.removeBookFromClub(clubId, id, user.getId());
    return ResponseEntity.noContent().build();
  }
}
