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
import com.gabriel.mylibrary.common.errors.ResourceConflictException;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;
import com.gabriel.mylibrary.common.errors.UnprocessableContentException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookClubMemberService {
  private final BookClubMemberMapper bookClubMemberMapper;
  private final BookClubMemberRepository bookClubMemberRepository;
  private final ClubBookRepository clubBookRepository;
  private final ClubBookProgressService clubBookProgressService;

  @Transactional
  public BookClubMemberDTO create(CreateBookClubMemberDTO bookClubMember) throws ResourceConflictException {
    validateBookClubMemberInsertion(bookClubMember.getBookClubId(), bookClubMember.getUserId());

    BookClubMemberEntity bookClubMemberEntity = bookClubMemberMapper.toEntity(bookClubMember);
    BookClubMemberEntity saved = bookClubMemberRepository.save(bookClubMemberEntity);

    clubBookRepository.findByClubIdAndIsCurrentTrue(bookClubMember.getBookClubId())
        .ifPresent(currentBook -> clubBookProgressService.initializeProgressForMember(saved, currentBook));

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
  public BookClubMemberDTO update(UUID id, UpdateBookClubMemberDTO bookClubMemberDto) throws ResourceNotFoundException {
    BookClubMemberEntity existingBookClubMember = bookClubMemberRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("No book club member found with the provided ID."));

    bookClubMemberMapper.updateEntityFromDto(bookClubMemberDto, existingBookClubMember);

    return bookClubMemberMapper.toDto(bookClubMemberRepository.save(existingBookClubMember));
  }

  @Transactional
  public void delete(UUID id) throws ResourceNotFoundException {
    BookClubMemberEntity existingBookClubMember = bookClubMemberRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("No book club member found with the provided ID."));
    bookClubMemberRepository.delete(existingBookClubMember);
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
}
