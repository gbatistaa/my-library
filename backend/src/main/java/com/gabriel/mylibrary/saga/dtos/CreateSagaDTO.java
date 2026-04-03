package com.gabriel.mylibrary.saga.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSagaDTO {
  @NotBlank(message = "Saga name is required")
  @Size(min = 3, max = 50, message = "Saga name must be between 3 and 50 characters")
  private String name;

  @Size(min = 3, message = "Saga description must be at least 3 characters")
  private String description;

  private String coverUrl;
}
