package com.gabriel.mylibrary.auth.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import com.gabriel.mylibrary.auth.dtos.AuthResponseDTO;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface AuthMapper {

  @Mapping(target = "accessToken", expression = "java(java.util.Optional.ofNullable(accessToken))")
  @Mapping(target = "refreshToken", expression = "java(java.util.Optional.ofNullable(refreshToken))")
  AuthResponseDTO toResponse(String accessToken, String refreshToken);
}
