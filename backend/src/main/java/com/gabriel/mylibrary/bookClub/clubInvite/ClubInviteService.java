package com.gabriel.mylibrary.bookClub.clubInvite;

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
import com.gabriel.mylibrary.user.UserEntity;

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

    validateClubInviteAcceptance(clubInviteEntity, loggedUserId);
    clubInviteEntity.setStatus(InviteStatus.ACCEPTED);
    createInviteeMember(clubInviteEntity);
    this.clubInviteRepository.save(clubInviteEntity);

    return this.clubInviteMapper.toAcceptedClubInviteProjection(clubInviteEntity);
  }

  @Transactional
  public void reject(UUID inviteId, UserEntity loggedUser) throws ResourceNotFoundException {
    ClubInviteEntity clubInviteEntity = this.clubInviteRepository.findById(inviteId)
        .orElseThrow(() -> new ResourceNotFoundException("Invite not found"));

    validateClubInviteReject(clubInviteEntity, inviteId);
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

  private void validateClubInviteAcceptance(ClubInviteEntity invite, UUID loggedUserId) {
    if (!invite.getStatus().equals(InviteStatus.PENDING)) {
      throw new ResourceConflictException("The invite acceptance is only for pending invites");
    }

    if (!invite.getInviteeId().equals(loggedUserId)) {
      throw new ForbiddenException("You cannot accept somebody else's invite.");
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

  private void validateClubInviteReject(ClubInviteEntity invite, UUID loggedUserId) {
    if (!invite.getInviteeId().equals(loggedUserId)) {
      throw new ForbiddenException("You cannot reject somebody else's invite.");
    }

    if (!invite.getStatus().equals(InviteStatus.PENDING)) {
      throw new ResourceConflictException("You cannot reject a non-pendent invite.");
    }
  }
}

// Analisando o `ClubInviteService`, algumas validações importantes que estão
// faltando:

// ---

// TODO: **No método `create`**
// - Verificar se o **invitee existe** no sistema antes de criar o convite
// - Verificar se o **club existe** antes de criar o convite
// - Verificar se o **inviter é realmente membro/admin do clube** (qualquer um
// pode convidar agora)
// - Verificar se o **invitee não está banido/inativo** do clube

// ---

// TODO: **No método `accept`**
// - Verificar se o convite ainda está com status `PENDING` antes de aceitar —
// hoje você consegue aceitar um convite já aceito, pois não há essa checagem
// - Verificar se o convite não está **expirado** (caso você venha a adicionar
// um `expiresAt`)

// ---

// TODO: **No método `reject`**
// - Verificar se quem está rejeitando é realmente o **invitee** (igual ao
// `accept`, mas falta aqui)
// - Verificar se o convite está `PENDING` antes de rejeitar

// ---

// TODO: **No método `revoke`**
// - Verificar se quem está revogando é o **inviter ou um admin do clube** —
// hoje qualquer um pode revogar qualquer convite

// ---

// TODO: **Estrutural/transversal**
// - O `validateClubInviteRevocation` faz **duas queries** para o mesmo
// `inviteId` (uma no validate, outra no `revoke`). Você poderia buscar a
// entidade uma vez só e passar adiante
// - Ausência de validação de **convite para si mesmo** (`inviterId ==
// inviteeId`)

// ---

// A mais crítica no momento é provavelmente a **falta de verificação de
// permissão no `reject` e no `revoke`**, pois expõe operações destrutivas sem
// controle de quem é o dono da ação.
