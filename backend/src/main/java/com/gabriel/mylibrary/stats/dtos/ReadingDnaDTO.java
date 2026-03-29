package com.gabriel.mylibrary.stats.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReadingDnaDTO {
  // Quantitative identity
  private int totalBooksLifetime;
  private int totalPagesLifetime;
  private double avgRating;
  private double completionRate;
  private double avgVelocityPagesPerHour;

  // Temporal patterns
  private int peakReadingHour;
  private double avgSessionDurationMin;
  private int avgPagesPerSession;

  // Taste diversity
  private List<GenreShareDTO> genreBreakdown;
  private String topAuthor;
  private int uniqueAuthorsRead;

  // Drop pattern
  private double dropRate;

  // Identity
  private String readerArchetype;
}
