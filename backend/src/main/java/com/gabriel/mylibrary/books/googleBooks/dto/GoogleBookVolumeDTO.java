package com.gabriel.mylibrary.books.googleBooks.dto;

import java.util.Set;

public record GoogleBookVolumeDTO(
    String googleBooksId,
    String title,
    String author,
    Integer pages,
    String isbn,
    String coverUrl,
    String description,
    String publishedDate,
    String publisher,
    String language,
    Set<String> categories) {
}
