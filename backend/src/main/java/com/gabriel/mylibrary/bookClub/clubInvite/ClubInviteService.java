package com.gabriel.mylibrary.bookClub.clubInvite;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.gabriel.mylibrary.bookClub.bookClubMembers.BookClubMemberService;
import com.gabriel.mylibrary.bookClub.clubInvite.dtos.ClubInviteDTO;
import com.gabriel.mylibrary.bookClub.clubInvite.dtos.CreateClubInviteDTO;
import com.gabriel.mylibrary.common.errors.ResourceConflictException;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClubInviteService {

  private final BookClubMemberService bookClubMemberService;
  private final ClubInviteMapper clubInviteMapper;
  private final ClubInviteRepository clubInviteRepository;

  public ClubInviteDTO create(CreateClubInviteDTO clubInvite) {
    validateBookClubInvite(clubInvite);

    ClubInviteEntity clubInviteEntity = this.clubInviteMapper.toEntity(clubInvite);
    this.clubInviteRepository.save(clubInviteEntity);

    return this.clubInviteMapper.toDto(clubInviteEntity);
  }

  public ClubInviteDTO accept(UUID inviteId) throws ResourceNotFoundException {
    ClubInviteEntity clubInviteEntity = this.clubInviteRepository.findById(inviteId)
        .orElseThrow(() -> new ResourceNotFoundException("Invite not found"));
    this.clubInviteRepository.save(clubInviteEntity);

    return this.clubInviteMapper.toDto(clubInviteEntity);
  }

  public void reject(UUID inviteId) throws ResourceNotFoundException {
    ClubInviteEntity clubInviteEntity = this.clubInviteRepository.findById(inviteId)
        .orElseThrow(() -> new ResourceNotFoundException("Invite not found"));
    this.clubInviteRepository.delete(clubInviteEntity);
  }

  public void revoke(UUID inviteId) throws ResourceNotFoundException {
    validateClubInviteRevocation(inviteId);
    ClubInviteEntity clubInviteEntity = this.clubInviteRepository.findById(inviteId)
        .orElseThrow(() -> new ResourceNotFoundException("Invite not found"));

    this.clubInviteRepository.delete(clubInviteEntity);
  }

  private void validateBookClubInvite(CreateClubInviteDTO clubInvite) throws ResourceConflictException {
    if (bookClubMemberService.isUserAlreadyAMember(clubInvite.getClubId(), clubInvite.getInviteeId())) {
      throw new ResourceConflictException("User is already a member of this book club");
    }

    if (this.clubInviteRepository.existsByBookClubIdAndInviteeIdAndStatus(clubInvite.getClubId(),
        clubInvite.getInviteeId(), InviteStatus.PENDING)) {
      throw new ResourceConflictException("User already has an invite to this book club");
    }
  }

  private void validateClubInviteRevocation(UUID inviteId) throws ResourceNotFoundException, ResourceConflictException {
    InviteStatus inviteStatus = this.clubInviteRepository.findById(inviteId)
        .orElseThrow(() -> new ResourceNotFoundException("Invite not found")).getStatus();

    if (inviteStatus != InviteStatus.PENDING) {
      throw new ResourceConflictException("Invite is already " + inviteStatus.name().toLowerCase());
    }
  }
}
