package com.gabriel.mylibrary.categories.mappers;

import com.gabriel.mylibrary.categories.dtos.CategoryDTO;
import com.gabriel.mylibrary.categories.dtos.CreateCategoryDTO;
import com.gabriel.mylibrary.categories.dtos.UpdateCategoryDTO;
import com.gabriel.mylibrary.categories.CategoryEntity;

import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CategoryMapper {

  CategoryEntity toEntity(CreateCategoryDTO createCategoryDTO);

  CategoryDTO toDto(CategoryEntity categoryEntity);

  @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
  void updateEntityFromDto(UpdateCategoryDTO updateCategoryDTO, @MappingTarget CategoryEntity categoryEntity);
}
