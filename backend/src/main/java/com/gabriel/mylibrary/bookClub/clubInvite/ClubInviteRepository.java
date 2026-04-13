package com.gabriel.mylibrary.bookClub.clubInvite;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClubInviteRepository extends JpaRepository<ClubInviteEntity, UUID> {
Boolean existsByBookClubIdAndInviteeId(UUID clubId, UUID inviteeId);

Boolean existsByBookClubIdAndInviteeIdAndStatus(UUID clubId, UUID inviteeId, InviteStatus status);

  Boolean existsByStatusIn(List<InviteStatus> statuses);
}
