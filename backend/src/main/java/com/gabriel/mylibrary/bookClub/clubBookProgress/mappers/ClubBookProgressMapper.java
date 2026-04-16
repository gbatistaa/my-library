package com.gabriel.mylibrary.bookClub.clubBookProgress.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.gabriel.mylibrary.bookClub.clubBookProgress.ClubBookProgressEntity;
import com.gabriel.mylibrary.bookClub.clubBookProgress.dtos.ClubBookProgressDTO;
import com.gabriel.mylibrary.bookClub.clubBookProgress.dtos.CreateClubBookProgressDTO;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ClubBookProgressMapper {
  @Mapping(target = "memberId", source = "member.id")
  @Mapping(target = "clubBookId", source = "clubBook.id")
  @Mapping(target = "startedAt", source = "startedAt")
  @Mapping(target = "progressPercent",
      expression = "java((int) Math.round(entity.getCurrentPage() * 100.0 / entity.getClubBook().getBook().getPages()))")
  ClubBookProgressDTO toDTO(ClubBookProgressEntity entity);

  @Mapping(target = "member.id", source = "memberId")
  @Mapping(target = "clubBook.id", source = "clubBookId")
  @Mapping(target = "currentPage", constant = "1")
  @Mapping(target = "startedAt", expression = "java(java.time.LocalDate.now())")
  @Mapping(target = "status", expression = "java(com.gabriel.mylibrary.bookClub.clubBookProgress.enums.MemberProgressStatus.READING)")
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "finishedAt", ignore = true)
  ClubBookProgressEntity toEntity(CreateClubBookProgressDTO dto);
}
