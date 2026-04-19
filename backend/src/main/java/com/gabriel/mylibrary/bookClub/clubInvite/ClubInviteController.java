package com.gabriel.mylibrary.bookClub.clubInvite;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/club-invites")
@RequiredArgsConstructor
public class ClubInviteController {

  private final ClubInviteService clubInviteService;

  @PostMapping
  public ResponseEntity<ClubInviteDTO> create(@RequestBody @Valid CreateClubInviteDTO clubInvite,
      @AuthenticationPrincipal UserEntity user)
      throws ResourceConflictException {
    log.info("[ClubInviteController] create | requesterId={} clubId={} inviteeId={}",
        user.getId(), clubInvite.getBookClubId(), clubInvite.getInviteeId());
    ClubInviteDTO clubInviteDTO = this.clubInviteService.create(clubInvite, user.getId());
    return ResponseEntity.ok(clubInviteDTO);
  }

  @GetMapping("/me/pending")
  public ResponseEntity<java.util.List<ClubInviteDTO>> findMyPendingInvites(@AuthenticationPrincipal UserEntity user) {
    return ResponseEntity.ok(clubInviteService.findAllPendingByInviteeId(user.getId()));
  }

  @PatchMapping("/{inviteId}/accept")
  public ResponseEntity<AcceptedClubInviteProjection> accept(@PathVariable UUID inviteId,
      @AuthenticationPrincipal UserEntity user)
      throws ResourceNotFoundException, ResourceConflictException {
    log.info("[ClubInviteController] accept | requesterId={} inviteId={}", user.getId(), inviteId);
    AcceptedClubInviteProjection acceptedClubInviteProjection = this.clubInviteService.accept(inviteId, user.getId());
    return ResponseEntity.ok(acceptedClubInviteProjection);
  }

  @PatchMapping("/{inviteId}/reject")
  public ResponseEntity<Void> reject(@PathVariable UUID inviteId, @AuthenticationPrincipal UserEntity user)
      throws ResourceNotFoundException, ResourceConflictException {
    this.clubInviteService.reject(inviteId, user);
    return ResponseEntity.noContent().build();
  }

  @PatchMapping("/{inviteId}/revoke")
  public ResponseEntity<Void> revoke(@PathVariable UUID inviteId, @AuthenticationPrincipal UserEntity user)
      throws ResourceNotFoundException, ResourceConflictException {
    this.clubInviteService.revoke(inviteId, user.getId());
    return ResponseEntity.noContent().build();
  }
}
