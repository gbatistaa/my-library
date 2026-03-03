package com.gabriel.mylibrary.books;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gabriel.mylibrary.books.dtos.BookDTO;
import com.gabriel.mylibrary.books.dtos.CreateBookDTO;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/book")
@RequiredArgsConstructor
public class BookController {

  private final BookService bookService;

  @GetMapping
  public ResponseEntity<List<BookDTO>> findAll() {
    List<BookDTO> books = bookService.findAll();
    return ResponseEntity.ok(books);
  }

  @PostMapping
  public ResponseEntity<BookDTO> create(@RequestBody CreateBookDTO dto) {
    BookDTO book = bookService.create(dto);
    return ResponseEntity.ok(book);
  }

}
