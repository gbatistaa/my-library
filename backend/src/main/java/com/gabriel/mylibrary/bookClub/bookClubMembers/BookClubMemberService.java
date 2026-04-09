package com.gabriel.mylibrary.bookClub.bookClubMembers;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException.UnprocessableContent;

import com.gabriel.mylibrary.bookClub.bookClubMembers.dtos.BookClubMemberDTO;
import com.gabriel.mylibrary.bookClub.bookClubMembers.dtos.CreateBookClubMemberDTO;
import com.gabriel.mylibrary.bookClub.bookClubMembers.dtos.UpdateBookClubMemberDTO;
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
    BookClubMemberEntity bookClubMemberEntity = bookClubMemberMapper.toEntity(bookClubMember);

    validateBookClubMemberInsertion(bookClubMemberEntity);

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

  private void validateBookClubMemberInsertion(BookClubMemberEntity bookClubMember) throws ResourceConflictException,
      UnprocessableContentException {
    if (bookClubMemberRepository.existsByBookClubIdAndUserId(bookClubMember.getBookClub().getId(),
        bookClubMember.getUser().getId())) {
      throw new ResourceConflictException("User is already a member of this book club");
    }

    if (bookClubMemberRepository.countAllByBookClubId(bookClubMember.getBookClub().getId()) >= bookClubMember
        .getBookClub().getMaxMembers()) {
      throw new UnprocessableContentException("Book club is full");
    }
  }
}
