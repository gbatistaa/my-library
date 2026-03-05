package com.gabriel.mylibrary.auth.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

import com.gabriel.mylibrary.auth.dtos.AuthResponseDTO;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface AuthMapper {

  AuthResponseDTO toResponse(String accessToken, String refreshToken);
}
