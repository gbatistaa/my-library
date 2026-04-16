package com.gabriel.mylibrary.bookClub.clubInvite.dtos;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateClubInviteDTO {
  @NotNull(message = "Club ID is required")
  private UUID bookClubId;

  @NotNull(message = "Invitee ID is required")
  private UUID inviteeId;
}
