package com.gabriel.mylibrary.books.userBook.mappers;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.gabriel.mylibrary.books.mappers.BookMapper;
import com.gabriel.mylibrary.books.userBook.UserBookEntity;
import com.gabriel.mylibrary.books.userBook.dtos.AddToLibraryDTO;
import com.gabriel.mylibrary.books.userBook.dtos.UpdateUserBookDTO;
import com.gabriel.mylibrary.books.userBook.dtos.UserBookDTO;

@Mapper(componentModel = "spring", uses = BookMapper.class, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserBookMapper {

  @Mapping(source = "saga.id", target = "sagaId")
  UserBookDTO toDto(UserBookEntity entity);

  @Mapping(target = "user", ignore = true)
  @Mapping(target = "book", ignore = true)
  @Mapping(target = "saga", ignore = true)
  UserBookEntity toEntity(AddToLibraryDTO dto);

  @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
  @Mapping(target = "user", ignore = true)
  @Mapping(target = "book", ignore = true)
  @Mapping(target = "saga", ignore = true)
  void updateEntityFromDto(UpdateUserBookDTO dto, @MappingTarget UserBookEntity entity);
}
