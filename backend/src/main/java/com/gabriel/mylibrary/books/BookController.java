package com.gabriel.mylibrary.books;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gabriel.mylibrary.books.dtos.BookDTO;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
public class BookController {

  private final BookService bookService;

  @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<BookDTO> findById(@PathVariable UUID id) {
    return ResponseEntity.ok(bookService.findById(id));
  }

  @GetMapping(value = "/google/{googleBooksId}", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<BookDTO> findByGoogleBooksId(@PathVariable String googleBooksId) {
    return ResponseEntity.ok(bookService.findOrFetchDtoByGoogleBooksId(googleBooksId));
  }

  @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<Page<BookDTO>> search(
      @RequestParam(required = false) String title,
      @PageableDefault(size = 10, sort = "title") Pageable pageable) {
    return ResponseEntity.ok(bookService.searchCatalog(title, pageable));
  }
}
