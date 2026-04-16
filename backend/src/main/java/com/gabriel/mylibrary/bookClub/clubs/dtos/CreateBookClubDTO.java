package com.gabriel.mylibrary.bookClub.clubs.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateBookClubDTO {
  @NotBlank(message = "Name is required")
  @Size(min = 3, max = 100, message = "Name must be between 3 and 100 characters")
  private String name;

  @NotBlank(message = "Description is required")
  @Size(min = 10, max = 1000, message = "Description must be between 10 and 1000 characters")
  private String description;

  @NotNull(message = "Max members is required")
  @Min(value = 3, message = "Max members must be at least 3")
  private Integer maxMembers;
}
