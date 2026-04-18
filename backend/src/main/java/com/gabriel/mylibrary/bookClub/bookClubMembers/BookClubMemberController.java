package com.gabriel.mylibrary.bookClub.bookClubMembers;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gabriel.mylibrary.bookClub.bookClubMembers.dtos.BookClubMemberDTO;
import com.gabriel.mylibrary.bookClub.bookClubMembers.dtos.CreateBookClubMemberDTO;
import com.gabriel.mylibrary.bookClub.bookClubMembers.dtos.UpdateBookClubMemberDTO;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class BookClubMemberController {

  private final BookClubMemberService bookClubMemberService;

  @PostMapping
  public BookClubMemberDTO createBookClubMember(@RequestBody @Valid CreateBookClubMemberDTO bookClubMember) {
    return bookClubMemberService.create(bookClubMember);
  }

  @GetMapping
  public Page<BookClubMemberDTO> getAllBookClubMembers(Pageable pageable) {
    return bookClubMemberService.findAll(pageable);
  }

  @GetMapping("/club/{clubId}")
  public Page<BookClubMemberDTO> getMembersByClub(@PathVariable UUID clubId,
      @AuthenticationPrincipal UserEntity user,
      Pageable pageable) {
    return bookClubMemberService.findAllByBookClubId(clubId, user.getId(), pageable);
  }

  @GetMapping("/{id}")
  public BookClubMemberDTO getBookClubMemberById(@PathVariable UUID id) {
    return bookClubMemberService.findById(id);
  }

  @PatchMapping("/{id}")
  public BookClubMemberDTO updateBookClubMember(@PathVariable UUID id,
      @RequestBody @Valid UpdateBookClubMemberDTO bookClubMember,
      @AuthenticationPrincipal UserEntity user) {
    return bookClubMemberService.update(id, bookClubMember, user.getId());
  }

  @DeleteMapping("/{id}")
  public void deleteBookClubMember(@PathVariable UUID id,
      @AuthenticationPrincipal UserEntity user) {
    bookClubMemberService.delete(id, user.getId());
  }
}
