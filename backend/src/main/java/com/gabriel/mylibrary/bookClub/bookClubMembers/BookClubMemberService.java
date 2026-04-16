package com.gabriel.mylibrary.bookClub.bookClubMembers;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gabriel.mylibrary.bookClub.bookClubMembers.dtos.BookClubMemberDTO;
import com.gabriel.mylibrary.bookClub.bookClubMembers.dtos.CreateBookClubMemberDTO;
import com.gabriel.mylibrary.bookClub.bookClubMembers.dtos.UpdateBookClubMemberDTO;
import com.gabriel.mylibrary.bookClub.bookClubMembers.enums.BookClubMemberRole;
import com.gabriel.mylibrary.bookClub.bookClubMembers.mappers.BookClubMemberMapper;
import com.gabriel.mylibrary.bookClub.clubBook.ClubBookRepository;
import com.gabriel.mylibrary.bookClub.clubBookProgress.ClubBookProgressService;
import com.gabriel.mylibrary.common.errors.ForbiddenException;
import com.gabriel.mylibrary.common.errors.ResourceConflictException;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;
import com.gabriel.mylibrary.common.errors.UnprocessableContentException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookClubMemberService {
  private final BookClubMemberMapper bookClubMemberMapper;
  private final BookClubMemberRepository bookClubMemberRepository;
  private final ClubBookRepository clubBookRepository;
  private final ClubBookProgressService clubBookProgressService;

  @Transactional
  public BookClubMemberDTO create(CreateBookClubMemberDTO bookClubMember) throws ResourceConflictException {
    log.info("[BookClubMemberService] addMember | clubId={} userId={}", bookClubMember.getBookClubId(), bookClubMember.getUserId());
    validateBookClubMemberInsertion(bookClubMember.getBookClubId(), bookClubMember.getUserId());

    BookClubMemberEntity bookClubMemberEntity = bookClubMemberMapper.toEntity(bookClubMember);
    BookClubMemberEntity saved = bookClubMemberRepository.save(bookClubMemberEntity);

    clubBookRepository.findByClubIdAndIsCurrentTrue(bookClubMember.getBookClubId())
        .ifPresent(currentBook -> clubBookProgressService.initializeProgressForMember(saved, currentBook));

    log.info("[BookClubMemberService] addMember | complete clubId={} memberId={}", bookClubMember.getBookClubId(), saved.getId());
    return bookClubMemberMapper.toDto(saved);
  }

  @Transactional(readOnly = true)
  public Page<BookClubMemberDTO> findAll(Pageable pageable) {
    return bookClubMemberRepository.findAll(pageable).map(bookClubMemberMapper::toDto);
  }

  @Transactional(readOnly = true)
  public Page<BookClubMemberDTO> findAllByBookClubId(UUID bookClubId, Pageable pageable) {
    return bookClubMemberRepository.findAllByBookClubId(bookClubId, pageable).map(bookClubMemberMapper::toDto);
  }

  @Transactional(readOnly = true)
  public BookClubMemberDTO findById(UUID id) throws ResourceNotFoundException {
    return bookClubMemberRepository.findById(id)
        .map(bookClubMemberMapper::toDto)
        .orElseThrow(() -> new ResourceNotFoundException("No book club member found with the provided ID."));
  }

  @Transactional
  public BookClubMemberDTO update(UUID id, UpdateBookClubMemberDTO bookClubMemberDto, UUID requesterId)
      throws ResourceNotFoundException {
    BookClubMemberEntity existingBookClubMember = bookClubMemberRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("No book club member found with the provided ID."));

    UUID clubId = existingBookClubMember.getBookClub().getId();
    requireAdmin(clubId, requesterId);

    bookClubMemberMapper.updateEntityFromDto(bookClubMemberDto, existingBookClubMember);

    return bookClubMemberMapper.toDto(bookClubMemberRepository.save(existingBookClubMember));
  }

  @Transactional
  public void delete(UUID id, UUID requesterId) throws ResourceNotFoundException {
    log.info("[BookClubMemberService] removeMember | memberId={} requesterId={}", id, requesterId);
    BookClubMemberEntity existingBookClubMember = bookClubMemberRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("No book club member found with the provided ID."));

    UUID clubId = existingBookClubMember.getBookClub().getId();
    UUID targetUserId = existingBookClubMember.getUser().getId();
    requireAdminOrSelf(clubId, requesterId, targetUserId);

    bookClubMemberRepository.delete(existingBookClubMember);
    log.info("[BookClubMemberService] removeMember | complete memberId={} clubId={}", id, clubId);
  }

  /* Validations */

  @Transactional(readOnly = true)
  public Boolean isMemberAdmin(UUID clubId, UUID memberId) {
    return bookClubMemberRepository.getBookClubMemberRoleById(memberId, clubId).equals(BookClubMemberRole.ADMIN);
  }

  @Transactional(readOnly = true)
  public Boolean isUserAlreadyAMember(UUID bookClubId, UUID userId) {
    return bookClubMemberRepository.existsByBookClubIdAndUserId(bookClubId, userId);
  }

  @Transactional(readOnly = true)
  public Boolean isUserAdminOfClub(UUID bookClubId, UUID userId) {
    return bookClubMemberRepository.existsByBookClubIdAndUserIdAndRole(bookClubId, userId, BookClubMemberRole.ADMIN);
  }

  @Transactional(readOnly = true)
  public Boolean isFirstMember(UUID bookClubId) {
    return bookClubMemberRepository.countByBookClubId(bookClubId) == 0;
  }

  @Transactional(readOnly = true)
  public Boolean isClubMemberBannedOrInactive(UUID clubId, UUID memberId) {
    return !bookClubMemberRepository.isClubMemberBannedOrInactive(clubId, memberId);
  }

  @Transactional(readOnly = true)
  private void validateBookClubMemberInsertion(UUID bookClubId, UUID userId)
      throws ResourceConflictException, UnprocessableContentException {
    if (isFirstMember(bookClubId)) {
      return;
    }

    if (isUserAlreadyAMember(bookClubId, userId)) {
      throw new ResourceConflictException("The user is already a member of this book club.");
    }

    if (isClubFull(bookClubId)) {
      throw new UnprocessableContentException("This book club has reached its maximum member capacity.");
    }
  }

  @Transactional(readOnly = true)
  private Boolean isClubFull(UUID bookClubId) {
    long currentMembers = bookClubMemberRepository.countByBookClubId(bookClubId);
    int capacity = bookClubMemberRepository.findById(bookClubId).get().getBookClub().getMaxMembers();

    return currentMembers >= capacity;
  }

  /* Authorization helpers */

  private void requireAdmin(UUID clubId, UUID requesterId) {
    boolean isAdmin = bookClubMemberRepository
        .existsByBookClubIdAndUserIdAndRole(clubId, requesterId, BookClubMemberRole.ADMIN);
    if (!isAdmin) {
      throw new ForbiddenException("Only a club admin can perform this action.");
    }
  }

  private void requireAdminOrSelf(UUID clubId, UUID requesterId, UUID targetUserId) {
    boolean isSelf = requesterId.equals(targetUserId);
    boolean isAdmin = bookClubMemberRepository
        .existsByBookClubIdAndUserIdAndRole(clubId, requesterId, BookClubMemberRole.ADMIN);
    if (!isSelf && !isAdmin) {
      throw new ForbiddenException("Only the member themselves or a club admin can remove a member.");
    }
  }
}
