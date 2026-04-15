package com.gabriel.mylibrary.bookClub.clubBook.mappers;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.gabriel.mylibrary.bookClub.clubBook.ClubBookEntity;
import com.gabriel.mylibrary.bookClub.clubBook.dtos.ClubBookDTO;
import com.gabriel.mylibrary.bookClub.clubBook.dtos.UpdateClubBookDTO;
import com.gabriel.mylibrary.books.mappers.BookMapper;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, uses = { BookMapper.class })
public interface ClubBookMapper {

  @Mapping(target = "clubId", source = "club.id")
  ClubBookDTO toDto(ClubBookEntity entity);

  @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
  @Mapping(target = "club", ignore = true)
  @Mapping(target = "book", ignore = true)
  @Mapping(target = "isCurrent", ignore = true)
  void updateEntityFromDto(UpdateClubBookDTO dto, @MappingTarget ClubBookEntity entity);
}
