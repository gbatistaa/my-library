package com.gabriel.mylibrary.auth.tokens.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

import com.gabriel.mylibrary.auth.tokens.RefreshTokenEntity;
import com.gabriel.mylibrary.auth.tokens.dtos.CreateRefreshTokenDTO;
import com.gabriel.mylibrary.auth.tokens.dtos.RefreshTokenDTO;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RefreshTokenMapper {
  RefreshTokenDTO toDTO(RefreshTokenEntity entity);

  RefreshTokenEntity toEntity(CreateRefreshTokenDTO dto);

}
