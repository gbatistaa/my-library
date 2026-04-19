package com.gabriel.mylibrary.bookClub.clubBookProgress;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gabriel.mylibrary.bookClub.bookClubMembers.BookClubMemberEntity;
import com.gabriel.mylibrary.bookClub.bookClubMembers.BookClubMemberRepository;
import com.gabriel.mylibrary.bookClub.bookClubMembers.enums.BookClubMemberStatus;
import com.gabriel.mylibrary.bookClub.clubBook.ClubBookEntity;
import com.gabriel.mylibrary.bookClub.clubBook.ClubBookRepository;
import com.gabriel.mylibrary.bookClub.clubBookProgress.dtos.ClubBookProgressDTO;
import com.gabriel.mylibrary.bookClub.clubBookProgress.dtos.UpdateClubBookProgressDTO;
import com.gabriel.mylibrary.bookClub.clubBookProgress.enums.MemberProgressStatus;
import com.gabriel.mylibrary.bookClub.clubBookProgress.mappers.ClubBookProgressMapper;
import com.gabriel.mylibrary.common.errors.ForbiddenException;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;
import com.gabriel.mylibrary.common.errors.UnprocessableContentException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClubBookProgressService {

  private final ClubBookProgressRepository repository;
  private final ClubBookProgressMapper mapper;
  private final ClubBookRepository clubBookRepository;
  private final BookClubMemberRepository bookClubMemberRepository;

  @Transactional
  public void initializeProgressForAllActiveMembers(ClubBookEntity clubBook) {
    List<BookClubMemberEntity> activeMembers = bookClubMemberRepository
        .findAllByBookClubIdAndStatus(clubBook.getClub().getId(), BookClubMemberStatus.ACTIVE);

    for (BookClubMemberEntity member : activeMembers) {
      if (!repository.existsByMemberIdAndClubBookId(member.getId(), clubBook.getId())) {
        createProgressRecord(member, clubBook);
      }
    }
  }

  @Transactional
  public void initializeProgressForMember(BookClubMemberEntity member, ClubBookEntity clubBook) {
    if (!repository.existsByMemberIdAndClubBookId(member.getId(), clubBook.getId())) {
      createProgressRecord(member, clubBook);
    }
  }

  @Transactional
  public ClubBookProgressDTO updateProgress(UUID progressId, UpdateClubBookProgressDTO dto) {
    log.info("[ClubBookProgressService] updateProgress | progressId={} newPage={}", progressId, dto.getCurrentPage());
    ClubBookProgressEntity progress = repository.findById(progressId)
        .orElseThrow(() -> new ResourceNotFoundException("Club book progress not found."));

    ClubBookEntity clubBook = progress.getClubBook();

    if (!Boolean.TRUE.equals(clubBook.getIsCurrent())) {
      log.warn("[ClubBookProgressService] updateProgress | rejected, book not current progressId={}", progressId);
      throw new UnprocessableContentException("Cannot update progress for a book that is not currently active.");
    }

    int newPage = dto.getCurrentPage();
    int totalPages = clubBook.getBook().getPages();

    if (newPage > totalPages) {
      log.warn("[ClubBookProgressService] updateProgress | rejected, page exceeds total progressId={} page={} total={}", progressId, newPage, totalPages);
      throw new UnprocessableContentException(
          "Current page (" + newPage + ") exceeds total pages (" + totalPages + ").");
    }

    progress.setCurrentPage(newPage);

    if (newPage >= totalPages) {
      progress.setFinishedAt(LocalDate.now());
      progress.setStatus(MemberProgressStatus.FINISHED);
    } else if (progress.getFinishedAt() != null) {
      // Regression: member went back below totalPages — clear completion
      progress.setFinishedAt(null);
      progress.setStatus(MemberProgressStatus.READING);
    }

    markOverdueProgressAsUnfinished(clubBook);

    ClubBookProgressEntity saved = repository.save(progress);
    checkAndAutoClose(clubBook);

    log.info("[ClubBookProgressService] updateProgress | complete progressId={} status={}", progressId, saved.getStatus());
    return mapper.toDTOWithPercent(saved);
  }

  @Transactional(readOnly = true)
  public ClubBookProgressDTO findById(UUID id) {
    return repository.findById(id)
        .map(mapper::toDTOWithPercent)
        .orElseThrow(() -> new ResourceNotFoundException("Club book progress not found."));
  }

  @Transactional(readOnly = true)
  public ClubBookProgressDTO findByMemberAndClubBook(UUID memberId, UUID clubBookId) {
    return repository.findByMemberIdAndClubBookId(memberId, clubBookId)
        .map(mapper::toDTOWithPercent)
        .orElseThrow(() -> new ResourceNotFoundException("Club book progress not found."));
  }

  @Transactional(readOnly = true)
  public List<ClubBookProgressDTO> listProgressForClubBook(UUID clubId, UUID clubBookId, UUID requesterId) {
    requireMember(clubId, requesterId);
    requireClubBookExists(clubId, clubBookId);
    return repository.findAllByClubBookId(clubBookId).stream()
        .map(mapper::toDTOWithPercent)
        .toList();
  }

  @Transactional(readOnly = true)
  public ClubBookProgressDTO getMyProgress(UUID clubId, UUID clubBookId, UUID requesterId) {
    BookClubMemberEntity member = requireActiveMember(clubId, requesterId);
    requireClubBookExists(clubId, clubBookId);
    return repository.findByMemberIdAndClubBookId(member.getId(), clubBookId)
        .map(mapper::toDTOWithPercent)
        .orElseThrow(() -> new ResourceNotFoundException("Progress record not found for this member and book."));
  }

  @Transactional
  public ClubBookProgressDTO updateMyProgress(UUID clubId, UUID clubBookId, UpdateClubBookProgressDTO dto,
      UUID requesterId) {
    BookClubMemberEntity member = requireActiveMember(clubId, requesterId);
    requireClubBookExists(clubId, clubBookId);
    ClubBookProgressEntity progress = repository.findByMemberIdAndClubBookId(member.getId(), clubBookId)
        .orElseThrow(() -> new ResourceNotFoundException("Progress record not found for this member and book."));
    return updateProgress(progress.getId(), dto);
  }

  private void createProgressRecord(BookClubMemberEntity member, ClubBookEntity clubBook) {
    ClubBookProgressEntity progress = new ClubBookProgressEntity();
    progress.setMember(member);
    progress.setClubBook(clubBook);
    progress.setCurrentPage(1);
    progress.setStartedAt(LocalDate.now());
    progress.setStatus(MemberProgressStatus.READING);
    repository.save(progress);
  }

  private void checkAndAutoClose(ClubBookEntity clubBook) {
    log.info("[ClubBookProgressService] checkAndAutoClose | clubBookId={}", clubBook.getId());
    markOverdueProgressAsUnfinished(clubBook);

    List<BookClubMemberEntity> activeMembers = bookClubMemberRepository
        .findAllByBookClubIdAndStatus(clubBook.getClub().getId(), BookClubMemberStatus.ACTIVE);

    if (activeMembers.isEmpty()) {
      log.info("[ClubBookProgressService] checkAndAutoClose | no active members, skipping clubBookId={}", clubBook.getId());
      return;
    }

    List<ClubBookProgressEntity> allProgress = repository.findAllByClubBookId(clubBook.getId());

    boolean allDone = activeMembers.stream().allMatch(member ->
        allProgress.stream()
            .filter(p -> p.getMember().getId().equals(member.getId()))
            .anyMatch(p -> p.getStatus() == MemberProgressStatus.FINISHED
                || p.getStatus() == MemberProgressStatus.UNFINISHED));

    if (allDone) {
      clubBook.setFinishedAt(LocalDate.now());
      clubBook.setIsCurrent(false);
      clubBookRepository.save(clubBook);
      log.info("[ClubBookProgressService] checkAndAutoClose | auto-closed clubBookId={}", clubBook.getId());
    }
    log.info("[ClubBookProgressService] checkAndAutoClose | complete clubBookId={} allDone={}", clubBook.getId(), allDone);
  }

  private void markOverdueProgressAsUnfinished(ClubBookEntity clubBook) {
    if (clubBook.getDeadline() == null) {
      return;
    }

    LocalDate effectiveDeadline = effectiveDeadline(clubBook);
    if (effectiveDeadline == null || !effectiveDeadline.isBefore(LocalDate.now())) {
      return;
    }

    List<ClubBookProgressEntity> overdueProgress = repository.findAllByClubBookId(clubBook.getId())
        .stream()
        .filter(p -> p.getStatus() == MemberProgressStatus.READING)
        .toList();

    for (ClubBookProgressEntity progress : overdueProgress) {
      progress.setStatus(MemberProgressStatus.UNFINISHED);
      repository.save(progress);
    }
  }

  private LocalDate effectiveDeadline(ClubBookEntity clubBook) {
    if (clubBook.getDeadlineExtendedAt() != null) {
      return clubBook.getDeadlineExtendedAt();
    }
    return clubBook.getDeadline();
  }

  private BookClubMemberEntity requireActiveMember(UUID clubId, UUID userId) {
    return bookClubMemberRepository.findByBookClubIdAndUserId(clubId, userId)
        .filter(m -> m.getStatus() == BookClubMemberStatus.ACTIVE)
        .orElseThrow(() -> new ForbiddenException("You are not an active member of this club."));
  }

  private void requireMember(UUID clubId, UUID userId) {
    if (!bookClubMemberRepository.existsByBookClubIdAndUserId(clubId, userId)) {
      throw new ForbiddenException("Only club members can view progress.");
    }
  }

  private void requireClubBookExists(UUID clubId, UUID clubBookId) {
    clubBookRepository.findByIdAndClubId(clubBookId, clubId)
        .orElseThrow(() -> new ResourceNotFoundException("Club book not found."));
  }

  @Transactional
  public void markReadingAsUnfinished(ClubBookEntity clubBook) {
    List<ClubBookProgressEntity> reading = repository
        .findAllByClubBookIdAndStatus(clubBook.getId(), MemberProgressStatus.READING);
    reading.forEach(p -> p.setStatus(MemberProgressStatus.UNFINISHED));
    repository.saveAll(reading);
    log.info("[ClubBookProgressService] markReadingAsUnfinished | clubBookId={} affected={}", clubBook.getId(), reading.size());
  }

  @Transactional
  public int markAllOverdueAsUnfinished() {
    log.info("[ClubBookProgressService] markAllOverdueAsUnfinished | starting");
    LocalDate today = LocalDate.now();
    // Fetch all READING progress records where clubBook.deadline is not null and < today
    List<ClubBookProgressEntity> overdue = repository.findAllOverdue(today);
    overdue.forEach(p -> {
        p.setStatus(MemberProgressStatus.UNFINISHED);
        // Do NOT set finishedAt — the member did not finish the book
    });
    repository.saveAll(overdue);
    log.info("[ClubBookProgressService] markAllOverdueAsUnfinished | complete affected={}", overdue.size());
    return overdue.size();
  }
}

