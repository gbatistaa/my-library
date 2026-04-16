package com.gabriel.mylibrary.bookClub.clubBookReview.dtos;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateClubBookReviewDTO {

  @NotNull
  @Min(1)
  @Max(5)
  private Integer rating;

  @NotBlank
  @Size(max = 2000)
  private String reviewText;
}
