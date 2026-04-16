package com.gabriel.mylibrary.bookClub.clubs;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gabriel.mylibrary.bookClub.clubs.dtos.BookClubDTO;
import com.gabriel.mylibrary.bookClub.clubs.dtos.ClubDashboardDTO;
import com.gabriel.mylibrary.bookClub.clubs.dtos.CreateBookClubDTO;
import com.gabriel.mylibrary.bookClub.clubs.dtos.UpdateBookClubDTO;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/book-clubs")
@RequiredArgsConstructor
public class BookClubController {
  private final BookClubService bookClubService;

  @GetMapping
  public ResponseEntity<Page<BookClubDTO>> findAll(Pageable pageable) {
    return ResponseEntity.ok(bookClubService.findAll(pageable));
  }

  @GetMapping("/{id}")
  public ResponseEntity<BookClubDTO> findById(@PathVariable UUID id) throws ResourceNotFoundException {
    return ResponseEntity.ok(bookClubService.findById(id));
  }

  @PostMapping
  public ResponseEntity<BookClubDTO> create(@RequestBody @Valid CreateBookClubDTO bookClub,
      @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(bookClubService.create(bookClub, user.getId()));
  }

  @PutMapping("/{id}")
  public ResponseEntity<BookClubDTO> update(@PathVariable UUID id, @RequestBody @Valid UpdateBookClubDTO bookClub,
      @AuthenticationPrincipal UserEntity user)
      throws ResourceNotFoundException {
    return ResponseEntity.ok(bookClubService.update(id, bookClub, user.getId()));
  }

  @GetMapping("/admin/{adminId}")
  public ResponseEntity<Page<BookClubDTO>> findAllByAdminId(@PathVariable UUID adminId, Pageable pageable) {
    return ResponseEntity.ok(bookClubService.findAllByAdminId(adminId, pageable));
  }

  @GetMapping("/{id}/dashboard")
  public ResponseEntity<ClubDashboardDTO> getDashboard(
      @PathVariable UUID id,
      @AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(bookClubService.getDashboard(id, user.getId()));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable UUID id,
      @AuthenticationPrincipal UserEntity user) throws ResourceNotFoundException {
    bookClubService.delete(id, user.getId());
    return ResponseEntity.noContent().build();
  }
}
