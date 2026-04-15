package com.gabriel.mylibrary.bookClub.bookClubMembers;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.gabriel.mylibrary.bookClub.bookClubMembers.enums.BookClubMemberRole;

@Repository
public interface BookClubMemberRepository extends JpaRepository<BookClubMemberEntity, UUID> {
  Page<BookClubMemberEntity> findAllByBookClubId(UUID bookClubId, Pageable pageable);

  Boolean existsByBookClubIdAndUserId(UUID bookClubId, UUID userId);

  Boolean existsByBookClubIdAndUserIdAndRole(UUID bookClubId, UUID userId, BookClubMemberRole role);

  long countByBookClubId(UUID bookClubId);

  @Query("""
      SELECT m.role
        FROM BookClubMemberEntity m
       WHERE m.id = :inviterId
         AND m.bookClub.id = :clubId
      """)
  BookClubMemberRole getBookClubMemberRoleById(@Param("inviterId") UUID inviterId, @Param("clubId") UUID clubId);

  @Query("""
      SELECT CASE WHEN COUNT(m) > 0 THEN TRUE ELSE FALSE END
        FROM BookClubMemberEntity m
       WHERE m.bookClub.id = :clubId
         AND m.id = :memberId
         AND m.status IN (com.gabriel.mylibrary.bookClub.bookClubMembers.enums.BookClubMemberStatus.BANNED,
                          com.gabriel.mylibrary.bookClub.bookClubMembers.enums.BookClubMemberStatus.INACTIVE)
      """)
  Boolean isClubMemberBannedOrInactive(@Param("clubId") UUID clubId, @Param("memberId") UUID memberId);
}
