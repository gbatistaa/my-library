package com.gabriel.mylibrary.saga.dtos;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSagaDTO {

  @Size(min = 3, max = 50, message = "Saga name must be between 3 and 50 characters")
  private String name;

  @Size(min = 3, message = "Saga description must be at least 3 characters")
  private String description;

  private String coverUrl;

  @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "Invalid hexadecimal color code")
  private String color;
}
