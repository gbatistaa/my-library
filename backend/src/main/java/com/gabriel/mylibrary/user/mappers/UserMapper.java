package com.gabriel.mylibrary.user.mappers;

import org.mapstruct.*;

import com.gabriel.mylibrary.user.UserEntity;
import com.gabriel.mylibrary.user.dtos.CreateUserDTO;
import com.gabriel.mylibrary.user.dtos.UpdateUserDTO;
import com.gabriel.mylibrary.user.dtos.UserDTO;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

  UserDTO toDTO(UserEntity user);

  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  @Mapping(target = "id", ignore = true)
  UserEntity toEntity(CreateUserDTO user);

  @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
  @Mapping(target = "password", ignore = true)
  void updateEntityFromDto(UpdateUserDTO updateUserDTO, @MappingTarget UserEntity userEntity);
}
