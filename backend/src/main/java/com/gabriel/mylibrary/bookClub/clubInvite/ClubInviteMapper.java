package com.gabriel.mylibrary.bookClub.clubInvite;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.gabriel.mylibrary.bookClub.clubInvite.dtos.ClubInviteDTO;
import com.gabriel.mylibrary.bookClub.clubInvite.dtos.CreateClubInviteDTO;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ClubInviteMapper {

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  @Mapping(target = "status", constant = "PENDING")
  @Mapping(target = "club", ignore = true)
  @Mapping(target = "inviter", ignore = true)
  @Mapping(target = "invitee", ignore = true)
  @Mapping(target = "token", ignore = true)
  @Mapping(target = "expiresAt", ignore = true)
  ClubInviteEntity toEntity(CreateClubInviteDTO dto);

  @Mapping(target = "clubId", source = "club.id")
  @Mapping(target = "inviterName", source = "inviter.name")
  @Mapping(target = "inviteeName", source = "invitee.name")
  @Mapping(target = "clubName", source = "club.name")
  ClubInviteDTO toDto(ClubInviteEntity entity);
}
