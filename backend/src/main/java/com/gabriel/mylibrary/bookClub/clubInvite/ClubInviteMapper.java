package com.gabriel.mylibrary.bookClub.clubInvite;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.gabriel.mylibrary.bookClub.clubInvite.dtos.ClubInviteDTO;
import com.gabriel.mylibrary.bookClub.clubInvite.dtos.CreateClubInviteDTO;
import com.gabriel.mylibrary.bookClub.clubInvite.projections.AcceptedClubInviteProjection;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ClubInviteMapper {

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  @Mapping(target = "status", constant = "PENDING")
  @Mapping(target = "bookClub", ignore = true)
  @Mapping(target = "inviter", ignore = true)
  @Mapping(target = "invitee", ignore = true)
  @Mapping(target = "token", ignore = true)
  @Mapping(target = "expiresAt", ignore = true)
  @Mapping(target = "acceptedAt", ignore = true)
  ClubInviteEntity toEntity(CreateClubInviteDTO dto);

  @Mapping(target = "clubId", source = "bookClub.id")
  @Mapping(target = "inviterName", source = "inviter.name")
  @Mapping(target = "inviteeName", source = "invitee.name")
  @Mapping(target = "clubName", source = "bookClub.name")
  ClubInviteDTO toDto(ClubInviteEntity entity);

  @Mapping(target = "inviterName", source = "inviter.name")
  @Mapping(target = "inviteeName", source = "invitee.name")
  @Mapping(target = "clubName", source = "bookClub.name")
  AcceptedClubInviteProjection toAcceptedClubInviteProjection(ClubInviteEntity entity);
}
