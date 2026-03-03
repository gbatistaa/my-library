package com.gabriel.mylibrary.books;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import com.gabriel.mylibrary.books.dtos.BookDTO;
import com.gabriel.mylibrary.books.dtos.CreateBookDTO;
import com.gabriel.mylibrary.books.mappers.BookMapper;
import com.gabriel.mylibrary.common.errors.ResourceConflictException;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookService {

  private final BookMapper bookMapper;
  private final BookRepository bookRepository;

  public List<BookDTO> findAll() {
    return bookRepository.findAll()
        .stream()
        .map(bookMapper::toDto)
        .toList();
  }

  public BookDTO create(@Valid @RequestBody CreateBookDTO book) {
    BookEntity newBook = bookMapper.toEntity(book);

    if (bookRepository.existsByIsbn(newBook.getIsbn())) {
      throw new ResourceConflictException("Book with this ISBN already exists: " + newBook.getIsbn());
    }

    BookEntity savedBook = bookRepository.save(newBook);
    return bookMapper.toDto(savedBook);
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
