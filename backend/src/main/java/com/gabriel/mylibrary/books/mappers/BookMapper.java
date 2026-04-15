package com.gabriel.mylibrary.books.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.gabriel.mylibrary.books.BookEntity;
import com.gabriel.mylibrary.books.dtos.BookDTO;
import com.gabriel.mylibrary.books.googleBooks.dto.GoogleBookVolumeDTO;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BookMapper {

  BookEntity toEntity(GoogleBookVolumeDTO volume);

  BookDTO toDto(BookEntity bookEntity);
}
