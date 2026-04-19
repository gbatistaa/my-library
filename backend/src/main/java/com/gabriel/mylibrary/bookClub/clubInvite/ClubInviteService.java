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
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClubInviteService {

  private final ClubInviteMapper clubInviteMapper;
  private final ClubInviteRepository clubInviteRepository;
  private final UserRepository userRepository;
  private final BookClubRepository bookClubRepository;
  private final BookClubMemberService bookClubMemberService;

  @Transactional
  public ClubInviteDTO create(CreateClubInviteDTO clubInvite, UUID inviterId) {
    log.info("[ClubInviteService] create | clubId={} inviteeId={} inviterId={}",
        clubInvite.getBookClubId(), clubInvite.getInviteeId(), inviterId);

    validateBookClubInvite(clubInvite, inviterId);

    ClubInviteEntity clubInviteEntity = clubInviteMapper.toEntity(clubInvite);

    clubInviteEntity.setInviter(userRepository.getReferenceById(inviterId));
    clubInviteEntity.setInvitee(userRepository.getReferenceById(clubInvite.getInviteeId()));
    clubInviteEntity.setBookClub(bookClubRepository.getReferenceById(clubInvite.getBookClubId()));
    clubInviteEntity.setToken(UUID.randomUUID().toString());
    clubInviteEntity.setStatus(InviteStatus.PENDING);
    clubInviteEntity.setExpiresAt(LocalDate.now().plusDays(7));

    ClubInviteEntity savedClubInvite = clubInviteRepository.save(clubInviteEntity);

    return clubInviteMapper.toDto(savedClubInvite);
  }

  @Modifying
  @Transactional
  public AcceptedClubInviteProjection accept(UUID inviteId, UUID loggedUserId) throws ResourceNotFoundException {
    log.info("[ClubInviteService] accept | inviteId={} loggedUserId={}", inviteId, loggedUserId);
    ClubInviteEntity clubInviteEntity = clubInviteRepository.findById(inviteId)
        .orElseThrow(() -> new ResourceNotFoundException("The specified invitation could not be found."));

    validateClubInviteAcceptance(clubInviteEntity, loggedUserId);
    clubInviteEntity.setStatus(InviteStatus.ACCEPTED);
    createInviteeMember(clubInviteEntity);
    clubInviteRepository.save(clubInviteEntity);

    return clubInviteMapper.toAcceptedClubInviteProjection(clubInviteEntity);
  }

  @Transactional
  public void reject(UUID inviteId, UserEntity loggedUser) throws ResourceNotFoundException {
    log.info("[ClubInviteService] reject | inviteId={} loggedUserId={}", inviteId, loggedUser.getId());
    ClubInviteEntity clubInviteEntity = clubInviteRepository.findById(inviteId)
        .orElseThrow(() -> new ResourceNotFoundException("The specified invitation could not be found."));

    validateClubInviteReject(clubInviteEntity, loggedUser.getId());
    clubInviteRepository.delete(clubInviteEntity);
  }

  @Transactional
  public void revoke(UUID inviteId, UUID loggedUserId) throws ResourceNotFoundException {
    log.info("[ClubInviteService] revoke | inviteId={} loggedUserId={}", inviteId, loggedUserId);
    ClubInviteEntity clubInviteEntity = clubInviteRepository.findById(inviteId)
        .orElseThrow(() -> new ResourceNotFoundException("The specified invitation could not be found."));

    validateClubInviteRevocation(clubInviteEntity, loggedUserId);
    clubInviteRepository.delete(clubInviteEntity);
  }

  private void validateBookClubInvite(CreateClubInviteDTO clubInvite, UUID inviterId) {
    log.info("[ClubInviteService] validateBookClubInvite | clubId={} inviteeId={} inviterId={}",
        clubInvite.getBookClubId(), clubInvite.getInviteeId(), inviterId);
    validateInviterPermissions(clubInvite, inviterId);
    validateEntitiesExist(clubInvite);
    validateInviteConstraints(clubInvite, inviterId);
  }

  private void validateInviterPermissions(CreateClubInviteDTO clubInvite, UUID inviterId) throws ForbiddenException {
    log.info("[ClubInviteService] validateInviterPermissions | clubId={} inviterId={}",
        clubInvite.getBookClubId(), inviterId);
    if (!bookClubMemberService.isMemberAdmin(clubInvite.getBookClubId(), inviterId)) {
      throw new ForbiddenException("Insufficient permissions to invite members. Admin role required.");
    }

    System.out.println(
        "Inviter is active: " + bookClubMemberService.isClubMemberActive(clubInvite.getBookClubId(), inviterId));

    if (!bookClubMemberService.isClubMemberActive(clubInvite.getBookClubId(), inviterId)) {
      throw new ForbiddenException("Your account status does not allow you to send invitations.");
    }
  }

  private void validateEntitiesExist(CreateClubInviteDTO clubInvite) throws ResourceNotFoundException {
    if (!bookClubRepository.existsById(clubInvite.getBookClubId())) {
      throw new ResourceNotFoundException("The book club associated with this invitation no longer exists.");
    }

    if (!userRepository.existsById(clubInvite.getInviteeId())) {
      throw new ResourceNotFoundException("The user you are trying to invite does not exist.");
    }
  }

  private void validateInviteConstraints(CreateClubInviteDTO clubInvite, UUID inviterId) {
    log.info("[ClubInviteService] validateInviteConstraints | clubId={} inviteeId={} inviterId={}",
        clubInvite.getBookClubId(), clubInvite.getInviteeId(), inviterId);
    if (inviterId.equals(clubInvite.getInviteeId())) {
      throw new ResourceConflictException("You cannot invite yourself to a book club.");
    }

    Boolean isInviteeMember = bookClubMemberService.isUserAlreadyAMember(clubInvite.getBookClubId(),
        clubInvite.getInviteeId());

    if (isInviteeMember) {
      throw new ResourceConflictException("The user is already a member of this book club.");
    }

    if (!bookClubMemberService.isClubMemberActive(clubInvite.getBookClubId(), clubInvite.getInviteeId())
        && isInviteeMember) {
      throw new ResourceConflictException(
          "The user you are trying to invite has been banned or is inactive in this club.");
    }

    if (clubInviteRepository.existsByBookClubIdAndInviteeIdAndStatus(clubInvite.getBookClubId(),
        clubInvite.getInviteeId(), InviteStatus.PENDING)) {
      throw new ResourceConflictException("The user already has a pending invitation to this book club.");
    }
  }

  private void validateClubInviteRevocation(ClubInviteEntity invite, UUID loggedUserId) {
    if (invite.getStatus() != InviteStatus.PENDING) {
      throw new ResourceConflictException(
          "This invitation has already been " + invite.getStatus().name().toLowerCase() + " and cannot be modified.");
    }

    boolean isInviter = invite.getInviterId().equals(loggedUserId);
    boolean isClubAdmin = bookClubMemberService.isUserAdminOfClub(invite.getBookClub().getId(), loggedUserId);
    if (!isInviter && !isClubAdmin) {
      throw new ForbiddenException(
          "Insufficient permissions. Only the original inviter or a club administrator can revoke this invitation.");
    }
  }

  private void validateClubInviteAcceptance(ClubInviteEntity invite, UUID loggedUserId) {
    if (!invite.getInviteeId().equals(loggedUserId)) {
      throw new ForbiddenException("Access denied. You can only accept invitations addressed to you.");
    }

    if (!invite.getStatus().equals(InviteStatus.PENDING)) {
      throw new ResourceConflictException("Only pending invitations can be accepted.");
    }

    boolean isInviteExpired = invite.getStatus().equals(InviteStatus.EXPIRED)
        || (invite.getExpiresAt() != null && invite.getExpiresAt().isBefore(LocalDate.now()));
    if (isInviteExpired) {
      throw new ResourceConflictException("This invitation has expired and is no longer valid.");
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
      throw new ForbiddenException("Access denied. You can only reject invitations addressed to you.");
    }

    if (!invite.getStatus().equals(InviteStatus.PENDING)) {
      throw new ResourceConflictException("Only pending invitations can be rejected.");
    }
  }
}
