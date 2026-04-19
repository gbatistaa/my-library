package com.gabriel.mylibrary.bookClub.clubs;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gabriel.mylibrary.bookClub.bookClubMembers.enums.BookClubMemberStatus;

@Repository
public interface BookClubRepository extends JpaRepository<BookClubEntity, UUID> {
  Optional<BookClubEntity> findById(UUID id);

  Page<BookClubEntity> findAllByAdminId(UUID adminId, Pageable pageable);

  Boolean existsByStatusIn(List<BookClubMemberStatus> statusList);

  @org.springframework.data.jpa.repository.Query("SELECT bc FROM BookClubEntity bc JOIN BookClubMemberEntity bcm ON bc.id = bcm.bookClub.id WHERE bcm.user.id = :userId")
  Page<BookClubEntity> findAllByUserId(@org.springframework.data.repository.query.Param("userId") UUID userId, Pageable pageable);
}
