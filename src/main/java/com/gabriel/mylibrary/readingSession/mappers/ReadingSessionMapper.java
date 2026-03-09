package com.gabriel.mylibrary.readingSession.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.gabriel.mylibrary.readingSession.ReadingSessionEntity;
import com.gabriel.mylibrary.readingSession.dtos.CreateReadingSessionDTO;
import com.gabriel.mylibrary.readingSession.dtos.ReadingSessionDTO;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ReadingSessionMapper {

  ReadingSessionEntity toEntity(CreateReadingSessionDTO createReadingSessionDTO);

  @Mapping(source = "book.id", target = "bookId")
  ReadingSessionDTO toDto(ReadingSessionEntity readingSessionEntity);
}
