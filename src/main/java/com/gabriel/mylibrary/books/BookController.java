package com.gabriel.mylibrary.books;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gabriel.mylibrary.books.dtos.BookDTO;
import com.gabriel.mylibrary.books.dtos.CreateBookDTO;

import com.gabriel.mylibrary.books.dtos.UpdateBookDTO;
import com.gabriel.mylibrary.user.dtos.UserDTO;

import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/book")
@RequiredArgsConstructor
public class BookController {

  private final BookService bookService;

  @GetMapping
  public ResponseEntity<List<BookDTO>> findAll(@AuthenticationPrincipal UserDTO user) {
    List<BookDTO> books = bookService.findAll(user.getId());
    return ResponseEntity.ok(books);
  }

  @PostMapping
  public ResponseEntity<BookDTO> create(@Valid @RequestBody CreateBookDTO dto) {
    BookDTO book = bookService.create(dto);
    return ResponseEntity.status(HttpStatus.CREATED).body(book);
  }

  @GetMapping("/{id}")
  public ResponseEntity<BookDTO> findOne(@PathVariable UUID id) {
    BookDTO book = bookService.findOne(id);
    return ResponseEntity.ok(book);
  }

  @PatchMapping("/{id}")
  public ResponseEntity<BookDTO> update(@PathVariable UUID id, @Valid @RequestBody UpdateBookDTO dto) {
    BookDTO book = bookService.update(id, dto);
    return ResponseEntity.ok(book);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    bookService.delete(id);
    return ResponseEntity.noContent().build();
  }

}
