package com.gabriel.mylibrary.bookClub.clubBook;

import java.time.LocalDate;
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
import com.gabriel.mylibrary.bookClub.clubBookProgress.ClubBookProgressService;
import com.gabriel.mylibrary.bookClub.clubs.BookClubEntity;
import com.gabriel.mylibrary.bookClub.clubs.BookClubRepository;
import com.gabriel.mylibrary.books.BookEntity;
import com.gabriel.mylibrary.books.BookService;
import com.gabriel.mylibrary.common.errors.ForbiddenException;
import com.gabriel.mylibrary.common.errors.ResourceConflictException;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;
import com.gabriel.mylibrary.common.errors.UnprocessableContentException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClubBookService {

  private final ClubBookRepository clubBookRepository;
  private final ClubBookMapper clubBookMapper;
  private final BookClubRepository bookClubRepository;
  private final BookClubMemberRepository bookClubMemberRepository;
  private final BookService bookService;
  private final ClubBookProgressService clubBookProgressService;

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

    entity.setStartedAt(LocalDate.now());
    entity.setIsCurrent(true);

    ClubBookEntity saved = clubBookRepository.save(entity);
    clubBookProgressService.initializeProgressForAllActiveMembers(saved);

    return clubBookMapper.toDto(saved);
  }

  @Transactional
  public ClubBookDTO updateClubBook(UUID clubId, UUID clubBookId, UpdateClubBookDTO dto, UUID requesterId) {
    requireAdmin(clubId, requesterId);

    ClubBookEntity entity = clubBookRepository.findByIdAndClubId(clubBookId, clubId)
        .orElseThrow(() -> new ResourceNotFoundException("Club book not found"));

    clubBookMapper.updateEntityFromDto(dto, entity);

    validateDeadlineExtension(entity);

    // Admin manually closing the book
    if (entity.getFinishedAt() != null) {
      entity.setIsCurrent(false);
    }

    return clubBookMapper.toDto(clubBookRepository.save(entity));
  }

  private void validateDeadlineExtension(ClubBookEntity entity) {
    LocalDate deadline = entity.getDeadline();
    LocalDate extendedAt = entity.getDeadlineExtendedAt();

    if (extendedAt == null) {
      return;
    }
    if (deadline == null) {
      throw new UnprocessableContentException("deadlineExtendedAt requires a deadline to be set.");
    }
    if (!extendedAt.isAfter(deadline)) {
      throw new UnprocessableContentException("deadlineExtendedAt must be after the deadline.");
    }
    if (extendedAt.isAfter(deadline.plusDays(10))) {
      throw new UnprocessableContentException("deadlineExtendedAt cannot exceed deadline + 10 days.");
    }
  }

  /**
   * Closes the current book (if still open) and activates the next one in queue
   * by order_index. Returns the newly activated book.
   * Throws UnprocessableContentException if there is no next book in the queue.
   */
  @Transactional
  public ClubBookDTO advanceToNextBook(UUID clubId, UUID requesterId) {
    requireAdmin(clubId, requesterId);

    // Close current book if it is still marked as active
    clubBookRepository.findByClubIdAndIsCurrentTrue(clubId).ifPresent(current -> {
      current.setIsCurrent(false);
      if (current.getFinishedAt() == null) {
        current.setFinishedAt(LocalDate.now());
      }
      clubBookRepository.save(current);
    });

    // Pick the next unread book by order_index
    ClubBookEntity next = clubBookRepository
        .findFirstByClubIdAndIsCurrentFalseAndFinishedAtIsNullOrderByOrderIndexAsc(clubId)
        .orElseThrow(() -> new UnprocessableContentException("No next book in the club's reading queue."));

    next.setIsCurrent(true);
    next.setStartedAt(LocalDate.now());
    ClubBookEntity saved = clubBookRepository.save(next);
    clubBookProgressService.initializeProgressForAllActiveMembers(saved);

    return clubBookMapper.toDto(saved);
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
