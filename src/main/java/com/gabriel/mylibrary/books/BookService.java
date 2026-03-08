package com.gabriel.mylibrary.books;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gabriel.mylibrary.books.dtos.BookDTO;
import com.gabriel.mylibrary.books.dtos.CreateBookDTO;
import com.gabriel.mylibrary.books.dtos.UpdateBookDTO;
import com.gabriel.mylibrary.books.mappers.BookMapper;
import com.gabriel.mylibrary.common.errors.ResourceConflictException;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.persistence.EntityManager;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookService {

  private final BookMapper bookMapper;
  private final BookRepository bookRepository;
  private final EntityManager entityManager;

  @Transactional(readOnly = true)
  public Page<BookDTO> findAll(UUID userId, Pageable pageable) {
    return bookRepository.findAllByUserId(userId, pageable)
        .map(bookMapper::toDto);
  }

  @Transactional(readOnly = true)
  public BookDTO findOne(UUID id, UUID userId) {
    return bookRepository.findByIdAndUserId(id, userId)
        .map(bookMapper::toDto)
        .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
  }

  @Transactional(readOnly = true)
  public Page<BookDTO> findByTitle(String title, UUID userId, Pageable pageable) {
    if (title == null || title.isBlank()) {
      return findAll(userId, pageable);
    }
    return bookRepository.findAllByUserIdAndTitleContainingIgnoreCase(userId, title, pageable)
        .map(bookMapper::toDto);
  }

  @Transactional
  public BookDTO create(@Valid CreateBookDTO dto, UUID userId) {
    BookEntity newBook = bookMapper.toEntity(dto);

    if (bookRepository.existsByIsbnAndUserId(newBook.getIsbn(), userId)) {
      throw new ResourceConflictException("Book with this ISBN already exists in your library: " + newBook.getIsbn());
    }

    UserEntity userRef = entityManager.getReference(UserEntity.class, userId);
    newBook.setUser(userRef);

    return bookMapper.toDto(bookRepository.save(newBook));
  }

  @Transactional
  public BookDTO update(UUID id, UUID userId, @Valid UpdateBookDTO dto) {
    BookEntity book = bookRepository.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

    if (dto.getIsbn() != null && !dto.getIsbn().equals(book.getIsbn())) {
      if (bookRepository.existsByIsbnAndUserId(dto.getIsbn(), userId)) {
        throw new ResourceConflictException("Book with this ISBN already exists in your library: " + dto.getIsbn());
      }
    }

    bookMapper.updateEntityFromDto(dto, book);
    return bookMapper.toDto(bookRepository.save(book));
  }

  @Transactional
  public void delete(UUID id, UUID userId) {
    BookEntity book = bookRepository.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
    bookRepository.delete(book);
  }
}
