package com.gabriel.mylibrary.bookClub.bookClubMembers;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.gabriel.mylibrary.bookClub.bookClubMembers.enums.BookClubMemberRole;
import com.gabriel.mylibrary.bookClub.bookClubMembers.enums.BookClubMemberStatus;

@Repository
public interface BookClubMemberRepository extends JpaRepository<BookClubMemberEntity, UUID> {
  Page<BookClubMemberEntity> findAllByBookClubId(UUID bookClubId, Pageable pageable);

  Optional<BookClubMemberEntity> findByBookClubIdAndUserId(UUID bookClubId, UUID userId);

  Boolean existsByBookClubIdAndUserId(UUID bookClubId, UUID userId);

  Boolean existsByBookClubIdAndUserIdAndRole(UUID bookClubId, UUID userId, BookClubMemberRole role);

  long countByBookClubId(UUID bookClubId);

  @Query("""
      SELECT m.role
        FROM BookClubMemberEntity m
       WHERE m.user.id = :userId
         AND m.bookClub.id = :clubId
      """)
  BookClubMemberRole getBookClubMemberRoleById(@Param("userId") UUID userId, @Param("clubId") UUID clubId);

  @Query("""
      SELECT CASE WHEN COUNT(m) > 0 THEN TRUE ELSE FALSE END
        FROM BookClubMemberEntity m
       WHERE m.bookClub.id = :clubId
         AND m.user.id = :userId
         AND m.status = :status
      """)
  Boolean isClubMemberActive(@Param("clubId") UUID clubId, @Param("userId") UUID userId,
      @Param("status") BookClubMemberStatus status);

  List<BookClubMemberEntity> findAllByBookClubIdAndStatus(UUID bookClubId, BookClubMemberStatus status);
}
