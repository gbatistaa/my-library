package com.gabriel.mylibrary.bookClub.clubBookProgress;

import java.util.UUID;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClubBookProgressService {

  private final ClubBookProgressRepository repository;

  public ClubBookProgressEntity create(ClubBookProgressEntity entity) {
    return repository.save(entity);
  }

  public ClubBookProgressEntity update(ClubBookProgressEntity entity) {
    return repository.save(entity);
  }

  public void delete(ClubBookProgressEntity entity) {
    repository.delete(entity);
  }

  public ClubBookProgressEntity findById(UUID id) {
    return repository.findById(id).orElseThrow(() -> new RuntimeException("Club book progress not found"));
  }

  public ClubBookProgressEntity findByMemberAndClubBook(UUID memberId, UUID clubBookId) {
    return repository.findByMemberIdAndClubBookId(memberId, clubBookId)
        .orElseThrow(() -> new RuntimeException("Club book progress not found"));
  }
}
