package com.gabriel.mylibrary.saga.dtos;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SagaDTO {
  private UUID id;
  private String name;
  private String description;
}
