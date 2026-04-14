package com.gabriel.mylibrary.bookClub.clubInvite;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.gabriel.mylibrary.bookClub.clubInvite.projections.AcceptedClubInviteProjection;
import com.gabriel.mylibrary.bookClub.bookClubMembers.enums.BookClubMemberRole;
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
  Optional<AcceptedClubInviteProjection> getAcceptedInviteData(@Param("inviteId") UUID inviteId);

  @Query("""
          SELECT CASE
              WHEN EXISTS (SELECT 1 FROM BookClubMemberEntity m WHERE m.bookClub.id = ?1 AND m.user.id = ?2)
                  THEN 'MEMBER'
              WHEN EXISTS (SELECT 1 FROM ClubInviteEntity i WHERE i.bookClub.id = ?1 AND i.invitee.id = ?2 AND i.status = com.gabriel.mylibrary.bookClub.clubInvite.enums.InviteStatus.PENDING)
                  THEN 'INVITED'
              ELSE 'NONE'
          END
      """)
  String getUserStatusInClub(UUID clubId, UUID inviteeId);
}
