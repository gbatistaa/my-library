package com.gabriel.mylibrary.bookClub.clubBookReview.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

public record ClubBookReviewDTO(
    UUID id,
    UUID clubBookId,
    UUID userId,
    Integer rating,
    String reviewText,
    LocalDateTime createdAt) {
}
