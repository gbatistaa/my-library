package com.gabriel.mylibrary.bookClub.clubs.mappers;

import com.gabriel.mylibrary.bookClub.clubs.BookClubEntity;
import com.gabriel.mylibrary.bookClub.clubs.dtos.BookClubDTO;
import com.gabriel.mylibrary.bookClub.clubs.dtos.CreateBookClubDTO;
import com.gabriel.mylibrary.bookClub.clubs.dtos.UpdateBookClubDTO;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BookClubMapper {

  @Mapping(target = "members", ignore = true)
  @Mapping(target = "status", ignore = true)
  @Mapping(target = "admin", ignore = true)
  BookClubEntity toEntity(CreateBookClubDTO createBookClubDTO);

  @Mapping(target = "adminId", source = "admin.id")
  BookClubDTO toDto(BookClubEntity bookClubEntity);

  @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
  @Mapping(target = "admin", ignore = true)
  @Mapping(target = "members", ignore = true)
  void updateEntityFromDto(UpdateBookClubDTO updateBookClubDTO, @MappingTarget BookClubEntity bookClubEntity);
}
