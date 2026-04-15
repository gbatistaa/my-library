package com.gabriel.mylibrary.books.userBook.projections;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserBookReadingProjection(UUID id, String title, Integer pages, LocalDateTime createdAt) {
}
