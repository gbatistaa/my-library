package com.gabriel.mylibrary.readingSession.dtos;

import java.util.UUID;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReadingSessionDTO {

  @NotNull
  @Min(1)
  private Integer pagesRead;

  @NotNull
  @Min(1)
  private Long durationSeconds;

  @NotNull
  private UUID bookId;
}
