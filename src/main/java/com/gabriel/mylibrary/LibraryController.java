package com.gabriel.mylibrary;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/library") // Isso define o prefixo da URL
public class LibraryController {

  @GetMapping("/")
  public String hello() {
    return "Hello World\n";
  }
}
