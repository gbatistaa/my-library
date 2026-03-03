package com.gabriel.mylibrary.books;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.gabriel.mylibrary.books.dtos.BookDTO;
import com.gabriel.mylibrary.books.dtos.CreateBookDTO;
import com.gabriel.mylibrary.books.mappers.BookMapper;

@Service
public class BookService {
  private List<BookEntity> books = new ArrayList<BookEntity>();

  private final BookMapper bookMapper;

  public BookService(BookMapper bookMapper) {
    this.bookMapper = bookMapper;
  }

  public List<BookDTO> findAll() {
    List<BookDTO> booksDTOs = new ArrayList<BookDTO>();

    for (BookEntity book : books) {
      booksDTOs.add(bookMapper.toDto(book));
    }

    return booksDTOs;
  }

  public BookDTO create(CreateBookDTO book) {
    BookEntity newBook = bookMapper.toEntity(book);
    books.add(newBook);

    for (BookEntity bookEntity : books) {
      System.err.println(bookEntity.getName());
    }

    return bookMapper.toDto(newBook);
  }
}
