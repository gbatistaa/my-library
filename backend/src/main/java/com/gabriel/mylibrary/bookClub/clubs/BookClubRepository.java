package com.gabriel.mylibrary.bookClub.clubs;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookClubRepository extends JpaRepository<BookClubEntity, UUID> {
  Optional<BookClubEntity> findById(UUID id);

  Page<BookClubEntity> findAllByAdminId(UUID adminId, Pageable pageable);
}
