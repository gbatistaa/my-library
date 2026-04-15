package com.gabriel.mylibrary.common.errors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_GATEWAY)
public class GoogleBooksException extends RuntimeException {
  public GoogleBooksException(String message) {
    super(message);
  }

  public GoogleBooksException(String message, Throwable cause) {
    super(message, cause);
  }
}
