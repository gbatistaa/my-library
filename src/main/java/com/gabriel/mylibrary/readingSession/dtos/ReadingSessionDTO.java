package com.gabriel.mylibrary.readingSession.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReadingSessionDTO {
  private UUID id;
  private Integer pagesRead;
  private Long durationMinutes;
  private UUID bookId;
  private LocalDateTime createdAt;
}
