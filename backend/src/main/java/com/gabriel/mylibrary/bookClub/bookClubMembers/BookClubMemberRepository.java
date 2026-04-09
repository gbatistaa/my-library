    package com.gabriel.mylibrary.bookClub.bookClubMembers;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookClubMemberRepository extends JpaRepository<BookClubMemberEntity, UUID> {
  Page<BookClubMemberEntity> findAllByBookClubId(UUID bookClubId, Pageable pageable);

  Boolean existsByBookClubIdAndUserId(UUID bookClubId, UUID userId);
}
