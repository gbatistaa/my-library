package com.gabriel.mylibrary.bookClub.clubBook;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gabriel.mylibrary.bookClub.bookClubMembers.BookClubMemberRepository;
import com.gabriel.mylibrary.bookClub.bookClubMembers.enums.BookClubMemberRole;
import com.gabriel.mylibrary.bookClub.clubBook.dtos.AddClubBookDTO;
import com.gabriel.mylibrary.bookClub.clubBook.dtos.ClubBookDTO;
import com.gabriel.mylibrary.bookClub.clubBook.dtos.UpdateClubBookDTO;
import com.gabriel.mylibrary.bookClub.clubBook.mappers.ClubBookMapper;
import com.gabriel.mylibrary.bookClub.clubs.BookClubEntity;
import com.gabriel.mylibrary.bookClub.clubs.BookClubRepository;
import com.gabriel.mylibrary.books.BookEntity;
import com.gabriel.mylibrary.books.BookService;
import com.gabriel.mylibrary.common.errors.ForbiddenException;
import com.gabriel.mylibrary.common.errors.ResourceConflictException;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClubBookService {

  private final ClubBookRepository clubBookRepository;
  private final ClubBookMapper clubBookMapper;
  private final BookClubRepository bookClubRepository;
  private final BookClubMemberRepository bookClubMemberRepository;
  private final BookService bookService;

  @Transactional
  public ClubBookDTO addBookToClub(UUID clubId, AddClubBookDTO dto, UUID requesterId) {
    requireAdmin(clubId, requesterId);

    BookClubEntity club = bookClubRepository.findById(clubId)
        .orElseThrow(() -> new ResourceNotFoundException("Book club not found"));

    BookEntity book = bookService.findOrFetchByGoogleBooksId(dto.getGoogleBooksId());

    if (clubBookRepository.existsByClubIdAndBookId(clubId, book.getId())) {
      throw new ResourceConflictException("This book is already in the club's reading list.");
    }

    ClubBookEntity entity = new ClubBookEntity();
    entity.setClub(club);
    entity.setBook(book);
    entity.setOrderIndex(clubBookRepository.findMaxOrderIndexByClubId(clubId) + 1);
    entity.setIsCurrent(false);

    return clubBookMapper.toDto(clubBookRepository.save(entity));
  }

  @Transactional(readOnly = true)
  public List<ClubBookDTO> listBooksForClub(UUID clubId, UUID requesterId) {
    requireMember(clubId, requesterId);
    return clubBookRepository.findByClubIdOrderByOrderIndexAsc(clubId).stream()
        .map(clubBookMapper::toDto)
        .toList();
  }

  @Transactional
  public ClubBookDTO setCurrent(UUID clubId, UUID clubBookId, UUID requesterId) {
    requireAdmin(clubId, requesterId);

    ClubBookEntity entity = clubBookRepository.findByIdAndClubId(clubBookId, clubId)
        .orElseThrow(() -> new ResourceNotFoundException("Club book not found"));

    clubBookRepository.clearCurrentForClub(clubId);
    entity.setIsCurrent(true);
    return clubBookMapper.toDto(clubBookRepository.save(entity));
  }

  @Transactional
  public ClubBookDTO updateClubBook(UUID clubId, UUID clubBookId, UpdateClubBookDTO dto, UUID requesterId) {
    requireAdmin(clubId, requesterId);

    ClubBookEntity entity = clubBookRepository.findByIdAndClubId(clubBookId, clubId)
        .orElseThrow(() -> new ResourceNotFoundException("Club book not found"));

    clubBookMapper.updateEntityFromDto(dto, entity);
    return clubBookMapper.toDto(clubBookRepository.save(entity));
  }

  @Transactional
  public void removeBookFromClub(UUID clubId, UUID clubBookId, UUID requesterId) {
    requireAdmin(clubId, requesterId);

    ClubBookEntity entity = clubBookRepository.findByIdAndClubId(clubBookId, clubId)
        .orElseThrow(() -> new ResourceNotFoundException("Club book not found"));

    clubBookRepository.delete(entity);
  }

  private void requireAdmin(UUID clubId, UUID userId) {
    boolean isAdmin = bookClubMemberRepository.existsByBookClubIdAndUserIdAndRole(clubId, userId,
        BookClubMemberRole.ADMIN);
    if (!isAdmin) {
      throw new ForbiddenException("Only club admins can manage the club's reading list.");
    }
  }

  private void requireMember(UUID clubId, UUID userId) {
    if (!bookClubMemberRepository.existsByBookClubIdAndUserId(clubId, userId)) {
      throw new ForbiddenException("Only club members can view the club's reading list.");
    }
  }
}
