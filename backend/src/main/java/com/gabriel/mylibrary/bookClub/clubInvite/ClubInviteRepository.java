package com.gabriel.mylibrary.bookClub.clubInvite;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.gabriel.mylibrary.bookClub.clubInvite.projections.AcceptedClubInviteProjection;
import com.gabriel.mylibrary.bookClub.clubInvite.enums.InviteStatus;

@Repository
public interface ClubInviteRepository extends JpaRepository<ClubInviteEntity, UUID> {
  @Query("SELECT COUNT(i) > 0 FROM ClubInviteEntity i WHERE i.bookClub.id = :clubId AND i.invitee.id = :inviteeId")
  Boolean existsByBookClubIdAndInviteeId(@Param("clubId") UUID clubId, @Param("inviteeId") UUID inviteeId);

  @Query("SELECT COUNT(i) > 0 FROM ClubInviteEntity i WHERE i.bookClub.id = :clubId AND i.invitee.id = :inviteeId AND i.status = :status")
  Boolean existsByBookClubIdAndInviteeIdAndStatus(@Param("clubId") UUID clubId, @Param("inviteeId") UUID inviteeId,
      @Param("status") InviteStatus status);

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

}
