package com.gabriel.mylibrary.books;

import java.util.HashMap;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/book")
public class BooksController {

  @GetMapping
  public ResponseEntity<HashMap<String, Object>> findAll() {
    HashMap<String, Object> obj = new HashMap<>();
    obj.put("book", "livro");
    obj.put("author", "Gabriel");

    return ResponseEntity.ok(obj);
  }
}
