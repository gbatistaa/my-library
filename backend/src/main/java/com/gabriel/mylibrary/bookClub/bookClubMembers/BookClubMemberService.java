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
import com.gabriel.mylibrary.common.errors.ResourceConflictException;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;
import com.gabriel.mylibrary.common.errors.UnprocessableContentException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookClubMemberService {
  private final BookClubMemberRepository bookClubMemberRepository;
  private final BookClubMemberMapper bookClubMemberMapper;

  @Transactional
  public BookClubMemberDTO create(CreateBookClubMemberDTO bookClubMember) throws ResourceConflictException {
    validateBookClubMemberInsertion(bookClubMember.getBookClubId(), bookClubMember.getUserId());

    BookClubMemberEntity bookClubMemberEntity = bookClubMemberMapper.toEntity(bookClubMember);
    BookClubMemberDTO result = bookClubMemberMapper.toDto(bookClubMemberRepository.save(bookClubMemberEntity));

    return result;
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
        .orElseThrow(() -> new ResourceNotFoundException("Book club member not found"));
  }

  @Transactional
  public BookClubMemberDTO update(UUID id, UpdateBookClubMemberDTO bookClubMemberDto) throws ResourceNotFoundException {
    BookClubMemberEntity existingBookClubMember = bookClubMemberRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Book club member not found"));

    bookClubMemberMapper.updateEntityFromDto(bookClubMemberDto, existingBookClubMember);

    return bookClubMemberMapper.toDto(bookClubMemberRepository.save(existingBookClubMember));
  }

  @Transactional
  public void delete(UUID id) throws ResourceNotFoundException {
    BookClubMemberEntity existingBookClubMember = bookClubMemberRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Book club member not found"));
    bookClubMemberRepository.delete(existingBookClubMember);
  }

  private void validateBookClubMemberInsertion(UUID bookClubId, UUID userId)
      throws ResourceConflictException, UnprocessableContentException {
    if (isFirstMember(bookClubId)) {
      return;
    }

    if (isUserAlreadyAMember(bookClubId, userId)) {
      throw new ResourceConflictException("User is already a member of this book club");
    }

    if (isClubFull(bookClubId)) {
      throw new UnprocessableContentException("Book club is full");
    }
  }

  private Boolean isFirstMember(UUID bookClubId) {
    return bookClubMemberRepository.countByBookClubId(bookClubId) == 0;
  }

  public Boolean isUserAlreadyAMember(UUID bookClubId, UUID userId) {
    return bookClubMemberRepository.existsByBookClubIdAndUserId(bookClubId, userId);
  }

  public Boolean isUserAdminOfClub(UUID bookClubId, UUID userId) {
    return bookClubMemberRepository.existsByBookClubIdAndUserIdAndRole(bookClubId, userId, BookClubMemberRole.ADMIN);
  }

  private Boolean isClubFull(UUID bookClubId) {
    long currentMembers = bookClubMemberRepository.countByBookClubId(bookClubId);
    int capacity = bookClubMemberRepository.findById(bookClubId).get().getBookClub().getMaxMembers();

    return currentMembers >= capacity;

  }
}
