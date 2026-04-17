package com.gabriel.mylibrary.auth.tokens.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

import com.gabriel.mylibrary.auth.tokens.RefreshTokenEntity;
import com.gabriel.mylibrary.auth.tokens.dtos.CreateRefreshTokenDTO;
import com.gabriel.mylibrary.auth.tokens.dtos.RefreshTokenDTO;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RefreshTokenMapper {

  @Mapping(target = "id", source = "id")
  @Mapping(target = "userId", source = "userId")
  RefreshTokenDTO toDTO(RefreshTokenEntity entity);

  @Mapping(target = "userId", source = "userId")
  RefreshTokenEntity toEntity(CreateRefreshTokenDTO dto);
}
