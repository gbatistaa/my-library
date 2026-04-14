package com.gabriel.mylibrary.bookClub.clubInvite;

import java.time.LocalDate;
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
import com.gabriel.mylibrary.bookClub.clubs.BookClubRepository;
import com.gabriel.mylibrary.common.errors.ForbiddenException;
import com.gabriel.mylibrary.common.errors.ResourceConflictException;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;
import com.gabriel.mylibrary.user.UserEntity;
import com.gabriel.mylibrary.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClubInviteService {

  private final ClubInviteMapper clubInviteMapper;
  private final ClubInviteRepository clubInviteRepository;
  private final UserRepository userRepository;
  private final BookClubRepository bookClubRepository;
  private final BookClubMemberService bookClubMemberService;

  @Transactional
  public ClubInviteDTO create(CreateClubInviteDTO clubInvite) {
    validateBookClubInvite(clubInvite);

    ClubInviteEntity clubInviteEntity = clubInviteMapper.toEntity(clubInvite);
    clubInviteRepository.save(clubInviteEntity);

    return clubInviteMapper.toDto(clubInviteEntity);
  }

  @Modifying
  @Transactional
  public AcceptedClubInviteProjection accept(UUID inviteId, UUID loggedUserId) throws ResourceNotFoundException {
    ClubInviteEntity clubInviteEntity = clubInviteRepository.findById(inviteId)
        .orElseThrow(() -> new ResourceNotFoundException("Invite not found"));

    validateClubInviteAcceptance(clubInviteEntity, loggedUserId);
    clubInviteEntity.setStatus(InviteStatus.ACCEPTED);
    createInviteeMember(clubInviteEntity);
    clubInviteRepository.save(clubInviteEntity);

    return clubInviteMapper.toAcceptedClubInviteProjection(clubInviteEntity);
  }

  @Transactional
  public void reject(UUID inviteId, UserEntity loggedUser) throws ResourceNotFoundException {
    ClubInviteEntity clubInviteEntity = clubInviteRepository.findById(inviteId)
        .orElseThrow(() -> new ResourceNotFoundException("Invite not found"));

    validateClubInviteReject(clubInviteEntity, inviteId);
    clubInviteRepository.delete(clubInviteEntity);
  }

  @Transactional
  public void revoke(UUID inviteId, UUID loggedUserId) throws ResourceNotFoundException {
    ClubInviteEntity clubInviteEntity = clubInviteRepository.findById(inviteId)
        .orElseThrow(() -> new ResourceNotFoundException("Invite not found"));

    validateClubInviteRevocation(clubInviteEntity, loggedUserId);
    clubInviteRepository.delete(clubInviteEntity);
  }

  private void validateBookClubInvite(CreateClubInviteDTO clubInvite) throws ResourceConflictException {
    if (clubInvite.getInviterId().equals(clubInvite.getInviteeId())) {
      throw new ResourceConflictException("You cannot invite yourself to a book club.");
    }

    if (bookClubRepository.existsById(clubInvite.getClubId())) {
      throw new ResourceNotFoundException("The club of the invite does not exist.");
    }

    if (!userRepository.existsById(clubInvite.getInviteeId())) {
      throw new ResourceNotFoundException("The invited user does not exist.");
    }

    if (bookClubMemberService.isUserAlreadyAMember(clubInvite.getClubId(), clubInvite.getInviteeId())) {
      throw new ResourceConflictException("User is already a member of this book club");
    }

    if (clubInviteRepository.existsByBookClubIdAndInviteeIdAndStatus(clubInvite.getClubId(),
        clubInvite.getInviteeId(), InviteStatus.PENDING)) {
      throw new ResourceConflictException("User already has an invite to this book club");
    }
  }

  private void validateClubInviteRevocation(ClubInviteEntity invite, UUID loggedUserId) {
    if (invite.getStatus() != InviteStatus.PENDING) {
      throw new ResourceConflictException("Invite is already " + invite.getStatus().name().toLowerCase());
    }

    boolean isInviter = invite.getInviterId().equals(loggedUserId);
    boolean isClubAdmin = bookClubMemberService.isUserAdminOfClub(invite.getBookClub().getId(), loggedUserId);
    if (!isInviter && !isClubAdmin) {
      throw new ForbiddenException("Only the inviter or a club admin can revoke this invite.");
    }
  }

  private void validateClubInviteAcceptance(ClubInviteEntity invite, UUID loggedUserId) {
    if (!invite.getInviteeId().equals(loggedUserId)) {
      throw new ForbiddenException("You cannot accept somebody else's invite.");
    }

    Boolean isInviteExpired = invite.getExpiresAt() != null || invite.getExpiresAt().isBefore(LocalDate.now())
        || invite.getStatus().equals(InviteStatus.EXPIRED);
    if (isInviteExpired) {
      throw new ResourceConflictException("Invite has already expired");
    }

    if (!invite.getStatus().equals(InviteStatus.PENDING)) {
      throw new ResourceConflictException("The invite acceptance is only for pending invites");
    }
  }

  private void createInviteeMember(ClubInviteEntity invite) {
    CreateBookClubMemberDTO createBookClubMemberDTO = new CreateBookClubMemberDTO(
        invite.getBookClub().getId(),
        invite.getInvitee().getId(),
        BookClubMemberRole.MEMBER,
        BookClubMemberStatus.ACTIVE);
    bookClubMemberService.create(createBookClubMemberDTO);
  }

  private void validateClubInviteReject(ClubInviteEntity invite, UUID loggedUserId) {
    if (!invite.getInviteeId().equals(loggedUserId)) {
      throw new ForbiddenException("You cannot reject somebody else's invite.");
    }

    if (!invite.getStatus().equals(InviteStatus.PENDING)) {
      throw new ResourceConflictException("You cannot reject a non-pendent invite.");
    }
  }
}

// TODO: **No método `create`**
// - Verificar se o **inviter é realmente membro/admin do clube** (qualquer um
// pode convidar agora)
// - Verificar se o **invitee não está banido/inativo** do clube

// ---

// TODO: **No método `accept`**
// - Verificar se o convite ainda está com status `PENDING` antes de aceitar —
// hoje você consegue aceitar um convite já aceito, pois não há essa checagem
