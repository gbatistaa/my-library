package com.gabriel.mylibrary.user.mappers;

import org.mapstruct.*;

import com.gabriel.mylibrary.user.UserEntity;
import com.gabriel.mylibrary.user.dtos.CreateUserDTO;
import com.gabriel.mylibrary.user.dtos.UpdateUserDTO;
import com.gabriel.mylibrary.user.dtos.UserDTO;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {
  UserDTO toDTO(UserEntity user);

  UserEntity toEntity(CreateUserDTO user);

  @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
  void updateEntityFromDto(UpdateUserDTO updateUserDTO, @MappingTarget UserEntity userEntity);
}
