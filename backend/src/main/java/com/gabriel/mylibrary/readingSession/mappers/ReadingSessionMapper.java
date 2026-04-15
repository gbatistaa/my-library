package com.gabriel.mylibrary.readingSession.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.gabriel.mylibrary.readingSession.ReadingSessionEntity;
import com.gabriel.mylibrary.readingSession.dtos.CreateReadingSessionDTO;
import com.gabriel.mylibrary.readingSession.dtos.ReadingSessionDTO;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ReadingSessionMapper {

  @Mapping(target = "userBook", ignore = true)
  ReadingSessionEntity toEntity(CreateReadingSessionDTO createReadingSessionDTO);

  @Mapping(source = "userBook.id", target = "userBookId")
  @Mapping(source = "userBook.book.id", target = "bookId")
  @Mapping(source = "userBook.book.title", target = "bookTitle")
  @Mapping(source = "userBook.book.coverUrl", target = "bookCoverUrl")
  ReadingSessionDTO toDto(ReadingSessionEntity readingSessionEntity);
}
