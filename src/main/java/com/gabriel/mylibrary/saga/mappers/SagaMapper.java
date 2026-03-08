package com.gabriel.mylibrary.saga.mappers;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.gabriel.mylibrary.saga.SagaEntity;
import com.gabriel.mylibrary.saga.dtos.CreateSagaDTO;
import com.gabriel.mylibrary.saga.dtos.SagaDTO;
import com.gabriel.mylibrary.saga.dtos.UpdateSagaDTO;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SagaMapper {

  SagaEntity toEntity(CreateSagaDTO createSagaDTO);

  SagaDTO toDto(SagaEntity sagaEntity);

  @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
  void updateEntityFromDto(UpdateSagaDTO updateSagaDTO, @MappingTarget SagaEntity sagaEntity);
}
