package com.gabriel.mylibrary.bookClub.bookClubMembers.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.gabriel.mylibrary.bookClub.bookClubMembers.BookClubMemberEntity;
import com.gabriel.mylibrary.bookClub.bookClubMembers.dtos.BookClubMemberDTO;
import com.gabriel.mylibrary.bookClub.bookClubMembers.dtos.CreateBookClubMemberDTO;
import com.gabriel.mylibrary.bookClub.bookClubMembers.dtos.UpdateBookClubMemberDTO;
import com.gabriel.mylibrary.user.mappers.UserMapper;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = { UserMapper.class }, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface BookClubMemberMapper {

  @Mapping(target = "bookClubId", source = "bookClub.id")
  @Mapping(target = "user", source = "user")
  @Mapping(target = "joinedAt", source = "createdAt")
  BookClubMemberDTO toDto(BookClubMemberEntity bookClubMember);

  @Mapping(target = "bookClub.id", source = "bookClubId")
  @Mapping(target = "user.id", source = "userId")
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  BookClubMemberEntity toEntity(CreateBookClubMemberDTO bookClubMember);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "bookClub", ignore = true)
  @Mapping(target = "user", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  void updateEntityFromDto(UpdateBookClubMemberDTO dto, @MappingTarget BookClubMemberEntity entity);
}
