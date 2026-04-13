package com.gabriel.mylibrary.bookClub.clubInvite;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gabriel.mylibrary.bookClub.bookClubMembers.BookClubMemberService;
import com.gabriel.mylibrary.bookClub.bookClubMembers.dtos.CreateBookClubMemberDTO;
import com.gabriel.mylibrary.bookClub.bookClubMembers.enums.BookClubMemberRole;
import com.gabriel.mylibrary.bookClub.bookClubMembers.enums.BookClubMemberStatus;
import com.gabriel.mylibrary.bookClub.clubInvite.dtos.ClubInviteDTO;
import com.gabriel.mylibrary.bookClub.clubInvite.dtos.CreateClubInviteDTO;
import com.gabriel.mylibrary.bookClub.clubInvite.enums.InviteStatus;
import com.gabriel.mylibrary.bookClub.clubInvite.projections.AcceptedClubInviteProjection;
import com.gabriel.mylibrary.common.errors.ForbiddenException;
import com.gabriel.mylibrary.common.errors.ResourceConflictException;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClubInviteService {

  private final BookClubMemberService bookClubMemberService;
  private final ClubInviteMapper clubInviteMapper;
  private final ClubInviteRepository clubInviteRepository;

  @Transactional
  public ClubInviteDTO create(CreateClubInviteDTO clubInvite) {
    validateBookClubInvite(clubInvite);

    ClubInviteEntity clubInviteEntity = this.clubInviteMapper.toEntity(clubInvite);
    this.clubInviteRepository.save(clubInviteEntity);

    return this.clubInviteMapper.toDto(clubInviteEntity);
  }

  @Modifying
  @Transactional
  public AcceptedClubInviteProjection accept(UUID inviteId, UUID loggedUserId) throws ResourceNotFoundException {
    ClubInviteEntity clubInviteEntity = this.clubInviteRepository.findById(inviteId)
        .orElseThrow(() -> new ResourceNotFoundException("Invite not found"));

    validateClubInviteAcceptance(clubInviteEntity.getInviteeId(), loggedUserId);
    clubInviteEntity.setStatus(InviteStatus.ACCEPTED);
    createInviteeMember(clubInviteEntity);
    this.clubInviteRepository.save(clubInviteEntity);

    return this.clubInviteMapper.toAcceptedClubInviteProjection(clubInviteEntity);
  }

  @Transactional
  public void reject(UUID inviteId) throws ResourceNotFoundException {
    ClubInviteEntity clubInviteEntity = this.clubInviteRepository.findById(inviteId)
        .orElseThrow(() -> new ResourceNotFoundException("Invite not found"));
    this.clubInviteRepository.delete(clubInviteEntity);
  }

  @Transactional
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

  private void validateClubInviteAcceptance(UUID inviteeId, UUID loggedUserId) {
    if (!inviteeId.equals(loggedUserId)) {
      throw new ForbiddenException("You cannot accept somebody else's invite");
    }
  }

  private void createInviteeMember(ClubInviteEntity invite) {
    CreateBookClubMemberDTO createBookClubMemberDTO = new CreateBookClubMemberDTO(
        invite.getBookClub().getId(),
        invite.getInvitee().getId(),
        BookClubMemberRole.MEMBER,
        BookClubMemberStatus.ACTIVE);
    this.bookClubMemberService.create(createBookClubMemberDTO);
  }
}
