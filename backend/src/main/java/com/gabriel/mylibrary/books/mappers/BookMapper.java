package com.gabriel.mylibrary.books.mappers;

import com.gabriel.mylibrary.books.BookEntity;
import com.gabriel.mylibrary.books.dtos.BookCategoryDTO;
import com.gabriel.mylibrary.books.dtos.BookDTO;
import com.gabriel.mylibrary.books.dtos.CreateBookDTO;
import com.gabriel.mylibrary.books.dtos.UpdateBookDTO;
import com.gabriel.mylibrary.categories.CategoryEntity;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BookMapper {

  @Mapping(target = "categories", ignore = true)
  BookEntity toEntity(CreateBookDTO createBookDTO);

  @Mapping(source = "categories", target = "categories")
  BookDTO toDto(BookEntity bookEntity);

  BookCategoryDTO toCategoryDto(CategoryEntity category);

  @Mapping(source = "categories", target = "categories")
  com.gabriel.mylibrary.books.dtos.BookSummaryDTO toSummaryDto(BookEntity bookEntity);

  com.gabriel.mylibrary.books.dtos.BookSummaryDTO.CategorySummaryDTO toCategorySummaryDto(CategoryEntity category);

  @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
  @Mapping(target = "categories", ignore = true)
  void updateEntityFromDto(UpdateBookDTO updateBookDTO, @MappingTarget BookEntity bookEntity);
}
