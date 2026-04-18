package com.gabriel.mylibrary.bookClub.clubBookProgress.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.gabriel.mylibrary.bookClub.clubBookProgress.ClubBookProgressEntity;
import com.gabriel.mylibrary.bookClub.clubBookProgress.dtos.ClubBookProgressDTO;
import com.gabriel.mylibrary.bookClub.clubBookProgress.dtos.CreateClubBookProgressDTO;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ClubBookProgressMapper {

  @Mapping(target = "id", source = "id")
  @Mapping(target = "memberId", source = "member.id")
  @Mapping(target = "clubBookId", source = "clubBook.id")
  @Mapping(target = "startedAt", source = "startedAt")
  @Mapping(target = "finishedAt", source = "finishedAt")
  @Mapping(target = "progressPercent", ignore = true)
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

  default ClubBookProgressDTO toDTOWithPercent(ClubBookProgressEntity entity) {
    ClubBookProgressDTO dto = toDTO(entity);
    if (entity.getClubBook() != null
        && entity.getClubBook().getBook() != null
        && entity.getClubBook().getBook().getPages() != null
        && entity.getClubBook().getBook().getPages() > 0) {
      int percent = (int) Math.round(entity.getCurrentPage() * 100.0 / entity.getClubBook().getBook().getPages());
      return new ClubBookProgressDTO(
          dto.id(), dto.memberId(), dto.clubBookId(), dto.currentPage(),
          percent, dto.status(), dto.startedAt(), dto.finishedAt());
    }
    return new ClubBookProgressDTO(
        dto.id(), dto.memberId(), dto.clubBookId(), dto.currentPage(),
        0, dto.status(), dto.startedAt(), dto.finishedAt());
  }
}
