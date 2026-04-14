package com.gabriel.mylibrary.bookClub.clubInvite;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gabriel.mylibrary.bookClub.clubInvite.dtos.ClubInviteDTO;
import com.gabriel.mylibrary.bookClub.clubInvite.dtos.CreateClubInviteDTO;
import com.gabriel.mylibrary.bookClub.clubInvite.projections.AcceptedClubInviteProjection;
import com.gabriel.mylibrary.common.errors.ResourceConflictException;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/club-invites")
@RequiredArgsConstructor
public class ClubInviteController {

  private final ClubInviteService clubInviteService;

  @PostMapping
  public ResponseEntity<ClubInviteDTO> create(@RequestBody @Valid CreateClubInviteDTO clubInvite)
      throws ResourceConflictException {
    ClubInviteDTO clubInviteDTO = this.clubInviteService.create(clubInvite);
    return ResponseEntity.ok(clubInviteDTO);
  }

  @PostMapping("/{inviteId}/accept")
  public ResponseEntity<AcceptedClubInviteProjection> accept(@PathVariable UUID inviteId,
      @AuthenticationPrincipal UserEntity user)
      throws ResourceNotFoundException, ResourceConflictException {
    AcceptedClubInviteProjection acceptedClubInviteProjection = this.clubInviteService.accept(inviteId, user.getId());
    return ResponseEntity.ok(acceptedClubInviteProjection);
  }

  @PostMapping("/{inviteId}/reject")
  public ResponseEntity<Void> reject(@PathVariable UUID inviteId, @AuthenticationPrincipal UserEntity user)
      throws ResourceNotFoundException, ResourceConflictException {
    this.clubInviteService.reject(inviteId, user);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/{inviteId}/revoke")
  public ResponseEntity<Void> revoke(@PathVariable UUID inviteId, @AuthenticationPrincipal UserEntity user)
      throws ResourceNotFoundException, ResourceConflictException {
    this.clubInviteService.revoke(inviteId, user.getId());
    return ResponseEntity.noContent().build();
  }
}
