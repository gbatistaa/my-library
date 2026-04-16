package com.gabriel.mylibrary.bookClub.clubs;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gabriel.mylibrary.bookClub.bookClubMembers.BookClubMemberEntity;
import com.gabriel.mylibrary.bookClub.bookClubMembers.BookClubMemberRepository;
import com.gabriel.mylibrary.bookClub.bookClubMembers.BookClubMemberService;
import com.gabriel.mylibrary.bookClub.bookClubMembers.dtos.CreateBookClubMemberDTO;
import com.gabriel.mylibrary.bookClub.bookClubMembers.enums.BookClubMemberRole;
import com.gabriel.mylibrary.bookClub.bookClubMembers.enums.BookClubMemberStatus;
import com.gabriel.mylibrary.bookClub.clubBook.ClubBookEntity;
import com.gabriel.mylibrary.bookClub.clubBook.ClubBookRepository;
import com.gabriel.mylibrary.bookClub.clubBookProgress.ClubBookProgressEntity;
import com.gabriel.mylibrary.bookClub.clubBookProgress.ClubBookProgressRepository;
import com.gabriel.mylibrary.bookClub.clubBookProgress.enums.MemberProgressStatus;
import com.gabriel.mylibrary.bookClub.clubs.dtos.BookClubDTO;
import com.gabriel.mylibrary.bookClub.clubs.dtos.ClubDashboardDTO;
import com.gabriel.mylibrary.bookClub.clubs.dtos.CreateBookClubDTO;
import com.gabriel.mylibrary.bookClub.clubs.dtos.CurrentBookStatsDTO;
import com.gabriel.mylibrary.bookClub.clubs.dtos.MemberProgressSummaryDTO;
import com.gabriel.mylibrary.bookClub.clubs.dtos.UpdateBookClubDTO;
import com.gabriel.mylibrary.bookClub.clubs.mappers.BookClubMapper;
import com.gabriel.mylibrary.common.errors.ForbiddenException;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookClubService {
  private final BookClubRepository bookClubRepository;
  private final BookClubMapper bookClubMapper;
  private final BookClubMemberService bookClubMemberService;
  private final BookClubMemberRepository bookClubMemberRepository;
  private final ClubBookRepository clubBookRepository;
  private final ClubBookProgressRepository clubBookProgressRepository;

  @Transactional
  public BookClubDTO create(CreateBookClubDTO bookClub, UUID adminId) {
    bookClub.setAdminId(adminId);
    BookClubEntity bookClubEntity = bookClubMapper.toEntity(bookClub);
    BookClubDTO createdBookClub = bookClubMapper.toDto(bookClubRepository.save(bookClubEntity));

    assignAdminAsMember(createdBookClub.getId(), adminId);

    return createdBookClub;
  }

  @Transactional(readOnly = true)
  public Page<BookClubDTO> findAll(Pageable pageable) {
    return bookClubRepository.findAll(pageable).map(bookClubMapper::toDto);
  }

  @Transactional(readOnly = true)
  public Page<BookClubDTO> findAllByAdminId(UUID adminId, Pageable pageable) {
    return bookClubRepository.findAllByAdminId(adminId, pageable).map(bookClubMapper::toDto);
  }

  @Transactional(readOnly = true)
  public BookClubDTO findById(UUID id) throws ResourceNotFoundException {
    return bookClubRepository.findById(id)
        .map(bookClubMapper::toDto)
        .orElseThrow(() -> new ResourceNotFoundException("Book club not found"));
  }

  @Transactional
  public BookClubDTO update(UUID id, UpdateBookClubDTO bookClubDto, UUID requesterId) throws ResourceNotFoundException {
    requireAdmin(id, requesterId);

    BookClubEntity existingBookClub = bookClubRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Book club not found"));

    bookClubMapper.updateEntityFromDto(bookClubDto, existingBookClub);

    return bookClubMapper.toDto(bookClubRepository.save(existingBookClub));
  }

  @Transactional
  public void delete(UUID id, UUID requesterId) throws ResourceNotFoundException {
    requireAdmin(id, requesterId);

    BookClubEntity existingBookClub = bookClubRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Book club not found"));
    bookClubRepository.delete(existingBookClub);
  }

  @Transactional(readOnly = true)
  public ClubDashboardDTO getDashboard(UUID clubId, UUID requesterId) {
    if (!bookClubMemberRepository.existsByBookClubIdAndUserId(clubId, requesterId)) {
      throw new ForbiddenException("Only club members can view the club dashboard.");
    }

    BookClubEntity club = bookClubRepository.findById(clubId)
        .orElseThrow(() -> new ResourceNotFoundException("Book club not found."));

    List<ClubBookEntity> allBooks = clubBookRepository.findByClubIdOrderByOrderIndexAsc(clubId);
    int totalBooks = allBooks.size();
    int finishedBooks = (int) allBooks.stream().filter(b -> b.getFinishedAt() != null).count();

    CurrentBookStatsDTO currentBookStats = clubBookRepository.findByClubIdAndIsCurrentTrue(clubId)
        .map(current -> buildCurrentBookStats(clubId, current))
        .orElse(null);

    return new ClubDashboardDTO(clubId, club.getName(), totalBooks, finishedBooks, currentBookStats);
  }

  private CurrentBookStatsDTO buildCurrentBookStats(UUID clubId, ClubBookEntity current) {
    List<BookClubMemberEntity> activeMembers =
        bookClubMemberRepository.findAllByBookClubIdAndStatus(clubId, BookClubMemberStatus.ACTIVE);
    List<ClubBookProgressEntity> progressList =
        clubBookProgressRepository.findAllByClubBookId(current.getId());

    int totalPages = current.getBook().getPages();

    List<MemberProgressSummaryDTO> memberProgress = progressList.stream()
        .map(p -> new MemberProgressSummaryDTO(
            p.getMember().getId(),
            p.getCurrentPage(),
            (int) Math.round(p.getCurrentPage() * 100.0 / totalPages),
            p.getStatus()))
        .toList();

    int finishedCount = (int) progressList.stream()
        .filter(p -> p.getStatus() == MemberProgressStatus.FINISHED).count();
    int pendingCount = (int) progressList.stream()
        .filter(p -> p.getStatus() == MemberProgressStatus.READING
            || p.getStatus() == MemberProgressStatus.UNFINISHED).count();
    int avgPercent = progressList.isEmpty() ? 0
        : (int) Math.round(progressList.stream()
            .mapToInt(p -> (int) Math.round(p.getCurrentPage() * 100.0 / totalPages))
            .average()
            .orElse(0));

    return new CurrentBookStatsDTO(
        current.getId(),
        current.getBook().getTitle(),
        current.getBook().getAuthor(),
        totalPages,
        current.getStartedAt(),
        current.getDeadline() != null ? current.getDeadlineExtendedAt() != null
            ? current.getDeadlineExtendedAt() : current.getDeadline() : null,
        activeMembers.size(),
        finishedCount,
        pendingCount,
        avgPercent,
        memberProgress);
  }

  private void assignAdminAsMember(UUID bookClubId, UUID adminId) {
    CreateBookClubMemberDTO bookClubMember = new CreateBookClubMemberDTO(bookClubId, adminId,
        BookClubMemberRole.ADMIN, BookClubMemberStatus.ACTIVE);
    bookClubMemberService.create(bookClubMember);
  }

  private void requireAdmin(UUID clubId, UUID requesterId) {
    boolean isAdmin = bookClubMemberRepository
        .existsByBookClubIdAndUserIdAndRole(clubId, requesterId, BookClubMemberRole.ADMIN);
    if (!isAdmin) {
      throw new ForbiddenException("Only a club admin can perform this action.");
    }
  }
}
