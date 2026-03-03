package com.gabriel.mylibrary.categories.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCategoryDTO {

  @NotBlank(message = "The category name is required")
  @Size(min = 3, max = 50, message = "The category name must be between 3 and 50 characters")
  private String name;

  @Size(max = 255, message = "The description must not exceed 255 characters")
  private String description;
}
