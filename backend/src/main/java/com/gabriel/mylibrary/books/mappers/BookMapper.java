package com.gabriel.mylibrary.books.mappers;

import com.gabriel.mylibrary.books.BookEntity;
import com.gabriel.mylibrary.books.dtos.BookDTO;
import com.gabriel.mylibrary.books.dtos.CreateBookDTO;
import com.gabriel.mylibrary.books.dtos.UpdateBookDTO;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BookMapper {

  @Mapping(target = "category", ignore = true)
  BookEntity toEntity(CreateBookDTO createBookDTO);

  @Mapping(source = "category.id", target = "categoryId")
  @Mapping(source = "category.name", target = "categoryName")
  @Mapping(source = "category.color", target = "categoryColor")
  BookDTO toDto(BookEntity bookEntity);

  @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
  @Mapping(target = "category", ignore = true)
  void updateEntityFromDto(UpdateBookDTO updateBookDTO, @MappingTarget BookEntity bookEntity);
}
