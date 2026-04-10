package com.gabriel.mylibrary.bookClub.clubs;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gabriel.mylibrary.bookClub.bookClubMembers.BookClubMemberService;
import com.gabriel.mylibrary.bookClub.bookClubMembers.dtos.CreateBookClubMemberDTO;
import com.gabriel.mylibrary.bookClub.bookClubMembers.enums.BookClubMemberRole;
import com.gabriel.mylibrary.bookClub.bookClubMembers.enums.BookClubMemberStatus;
import com.gabriel.mylibrary.bookClub.clubs.dtos.BookClubDTO;
import com.gabriel.mylibrary.bookClub.clubs.dtos.CreateBookClubDTO;
import com.gabriel.mylibrary.bookClub.clubs.dtos.UpdateBookClubDTO;
import com.gabriel.mylibrary.bookClub.clubs.mappers.BookClubMapper;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookClubService {
  private final BookClubRepository bookClubRepository;
  private final BookClubMapper bookClubMapper;
  private final BookClubMemberService bookClubMemberService;

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
  public BookClubDTO update(UUID id, UpdateBookClubDTO bookClubDto) throws ResourceNotFoundException {
    BookClubEntity existingBookClub = bookClubRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Book club not found"));

    bookClubMapper.updateEntityFromDto(bookClubDto, existingBookClub);

    return bookClubMapper.toDto(bookClubRepository.save(existingBookClub));
  }

  @Transactional
  public void delete(UUID id) throws ResourceNotFoundException {
    BookClubEntity existingBookClub = bookClubRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Book club not found"));
    bookClubRepository.delete(existingBookClub);
  }

  private void assignAdminAsMember(UUID bookClubId, UUID adminId) {
    CreateBookClubMemberDTO bookClubMember = new CreateBookClubMemberDTO(bookClubId, adminId,
        BookClubMemberRole.ADMIN, BookClubMemberStatus.ACTIVE);
    bookClubMemberService.create(bookClubMember);
  }
}
