package com.gabriel.mylibrary.books.projections;

import java.time.LocalDateTime;
import java.util.UUID;

public interface BookReadingProjection {
  UUID getId();
  String getTitle();
  int getPages();
  LocalDateTime getCreatedAt();
}
