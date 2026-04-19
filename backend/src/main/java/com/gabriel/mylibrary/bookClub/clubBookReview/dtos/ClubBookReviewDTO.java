package com.gabriel.mylibrary.bookClub.clubBookReview.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

import com.gabriel.mylibrary.user.dtos.UserDTO;

public record ClubBookReviewDTO(
    UUID id,
    UUID clubBookId,
    UserDTO user,
    Integer rating,
    String reviewText,
    LocalDateTime createdAt) {
}
