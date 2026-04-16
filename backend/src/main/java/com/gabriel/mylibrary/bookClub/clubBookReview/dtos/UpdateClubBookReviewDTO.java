package com.gabriel.mylibrary.bookClub.clubBookReview.dtos;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateClubBookReviewDTO {

  @Min(1)
  @Max(5)
  private Integer rating;

  @Size(min = 1, max = 2000)
  private String reviewText;
}
