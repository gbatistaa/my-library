package com.gabriel.mylibrary.books.googleBooks;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "google.books")
public record GoogleBooksProperties(String baseUrl, String apiKey, Integer timeoutMs) {

  public boolean hasApiKey() {
    return apiKey != null && !apiKey.isBlank();
  }
}
