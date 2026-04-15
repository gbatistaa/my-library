package com.gabriel.mylibrary.bookClub.clubBookProgress.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.gabriel.mylibrary.bookClub.clubBookProgress.ClubBookProgressEntity;
import com.gabriel.mylibrary.bookClub.clubBookProgress.dtos.ClubBookProgressDTO;
import com.gabriel.mylibrary.bookClub.clubBookProgress.dtos.CreateClubBookProgressDTO;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ClubBookProgressMapper {
  @Mapping(target = "memberId", source = "member.id")
  @Mapping(target = "clubBookId", source = "clubBook.id")
  @Mapping(target = "rating", source = "rating")
  @Mapping(target = "startedAt", source = "startedAt")
  ClubBookProgressDTO toDTO(ClubBookProgressEntity entity);

  @Mapping(target = "member.id", source = "memberId")
  @Mapping(target = "clubBook.id", source = "clubBookId")
  @Mapping(target = "rating", source = "rating")
  @Mapping(target = "startedAt", source = "startedAt")
  ClubBookProgressEntity toEntity(CreateClubBookProgressDTO dto);
}
