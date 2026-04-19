package com.gabriel.mylibrary.bookClub.clubs.mappers;

import com.gabriel.mylibrary.bookClub.clubs.BookClubEntity;
import com.gabriel.mylibrary.bookClub.clubs.dtos.BookClubDTO;
import com.gabriel.mylibrary.bookClub.clubs.dtos.CreateBookClubDTO;
import com.gabriel.mylibrary.bookClub.clubs.dtos.UpdateBookClubDTO;
import com.gabriel.mylibrary.bookClub.clubBook.ClubBookEntity;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BookClubMapper {

  @Mapping(target = "members", ignore = true)
  @Mapping(target = "status", ignore = true)
  @Mapping(target = "admin", ignore = true)
  BookClubEntity toEntity(CreateBookClubDTO createBookClubDTO);

  @Mapping(target = "adminId", source = "admin.id")
  @Mapping(target = "activeMembersCount", expression = "java(bookClubEntity.getMembers() != null ? bookClubEntity.getMembers().size() : 0)")
  @Mapping(target = "totalBooksCount", expression = "java(bookClubEntity.getBooks() != null ? bookClubEntity.getBooks().size() : 0)")
  BookClubDTO toDto(BookClubEntity bookClubEntity);

  @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
  @Mapping(target = "admin", ignore = true)
  @Mapping(target = "members", ignore = true)
  @Mapping(target = "books", ignore = true)
  void updateEntityFromDto(UpdateBookClubDTO updateBookClubDTO, @MappingTarget BookClubEntity bookClubEntity);
}
