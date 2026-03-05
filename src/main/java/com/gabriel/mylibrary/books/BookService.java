package com.gabriel.mylibrary.books;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

import com.gabriel.mylibrary.books.dtos.BookDTO;
import com.gabriel.mylibrary.books.dtos.CreateBookDTO;
import com.gabriel.mylibrary.books.mappers.BookMapper;
import com.gabriel.mylibrary.books.dtos.UpdateBookDTO;
import com.gabriel.mylibrary.common.errors.ResourceConflictException;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookService {

  private final BookMapper bookMapper;
  private final BookRepository bookRepository;

  @Transactional(readOnly = true)
  public List<BookDTO> findAll(UUID userId) {
    return bookRepository.findAllByUserId(userId)
        .stream()
        .map(bookMapper::toDto)
        .toList();
  }

  @Transactional(readOnly = true)
  public BookDTO findOne(UUID id) {
    return bookRepository.findById(id)
        .map(bookMapper::toDto)
        .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
  }

  @Transactional
  public BookDTO create(@Valid @RequestBody CreateBookDTO book) {
    BookEntity newBook = bookMapper.toEntity(book);

    if (bookRepository.existsByIsbn(newBook.getIsbn())) {
      throw new ResourceConflictException("Book with this ISBN already exists: " + newBook.getIsbn());
    }

    BookEntity savedBook = bookRepository.save(newBook);
    return bookMapper.toDto(savedBook);
  }

  @Transactional
  public BookDTO update(UUID id, @Valid UpdateBookDTO dto) throws ResourceNotFoundException {
    BookEntity book = bookRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

    if (dto.getIsbn() != null && !dto.getIsbn().equals(book.getIsbn())) {
      if (bookRepository.existsByIsbn(dto.getIsbn())) {
        throw new ResourceConflictException("Book with this ISBN already exists: " + dto.getIsbn());
      }
    }

    bookMapper.updateEntityFromDto(dto, book);
    BookEntity updatedBook = bookRepository.save(book);
    return bookMapper.toDto(updatedBook);
  }

  @Transactional
  public void delete(UUID id) throws ResourceNotFoundException {
    if (!bookRepository.existsById(id)) {
      throw new ResourceNotFoundException("Book not found with id: " + id);
    }
    bookRepository.deleteById(id);
  }

  @PostConstruct
  public void JustBorn() {
    System.out.println("Book server is just born");
  }

  @PreDestroy
  public void AboutToDie() {
    System.out.println("Book service is about to die");
  }
}
