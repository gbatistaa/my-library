package com.gabriel.mylibrary.books.mappers;

import com.gabriel.mylibrary.books.BookEntity;
import com.gabriel.mylibrary.books.dtos.BookDTO;
import com.gabriel.mylibrary.books.dtos.CreateBookDTO;
import com.gabriel.mylibrary.books.dtos.UpdateBookDTO;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BookMapper {

  BookEntity toEntity(CreateBookDTO createBookDTO);

  BookDTO toDto(BookEntity bookEntity);

  @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
  void updateEntityFromDto(UpdateBookDTO updateBookDTO, @MappingTarget BookEntity bookEntity);
}
