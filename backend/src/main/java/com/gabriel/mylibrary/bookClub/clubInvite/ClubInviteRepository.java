package com.gabriel.mylibrary.bookClub.clubInvite;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.gabriel.mylibrary.bookClub.clubInvite.projections.AcceptedClubInviteProjection;
import com.gabriel.mylibrary.bookClub.clubInvite.enums.InviteStatus;

@Repository
public interface ClubInviteRepository extends JpaRepository<ClubInviteEntity, UUID> {
  Boolean existsByBookClubIdAndInviteeId(UUID clubId, UUID inviteeId);

  Boolean existsByBookClubIdAndInviteeIdAndStatus(UUID clubId, UUID inviteeId, InviteStatus status);

  Boolean existsByStatusIn(List<InviteStatus> statuses);

  @Query("""
      SELECT new com.gabriel.mylibrary.bookClub.clubInvite.projections.AcceptedClubInviteProjection(
        i.invitee.name,
        i.inviter.name,
        i.bookClub.name
      )
      FROM ClubInviteEntity i
      WHERE i.id = :inviteId
      """)
  Optional<AcceptedClubInviteProjection> getAcceptedInviteData(UUID inviteId);

  @Query("""
          SELECT CASE
              WHEN EXISTS (SELECT 1 FROM BookClubMember m WHERE m.clubId = ?1 AND m.userId = ?2)
                  THEN 'MEMBER'
              WHEN EXISTS (SELECT 1 FROM ClubInvite i WHERE i.clubId = ?1 AND i.inviteeId = ?2 AND i.status = 'PENDING')
                  THEN 'INVITED'
              ELSE 'NONE'
          END
      """)
  String getUserStatusInClub(UUID clubId, UUID inviteeId);
}
