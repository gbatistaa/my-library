package com.gabriel.mylibrary.bookClub.clubBookProgress;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gabriel.mylibrary.bookClub.clubBookProgress.dtos.ClubBookProgressDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClubBookProgressService {

  private final ClubBookProgressRepository repository;

  @Transactional
  public ClubBookProgressDTO create(ClubBookProgressEntity entity) {
    return repository.save(entity);
  }

  @Transactional
  public ClubBookProgressDTO update(ClubBookProgressEntity entity) {
    return repository.save(entity);
  }

  @Transactional
  public void delete(ClubBookProgressEntity entity) {
    repository.delete(entity);
  }

  @Transactional(readOnly = true)
  public ClubBookProgressDTO findById(UUID id) {
    return repository.findById(id).orElseThrow(() -> new RuntimeException("Club book progress not found"));
  }

  @Transactional(readOnly = true)
  public ClubBookProgressDTO findByMemberAndClubBook(UUID memberId, UUID clubBookId) {
    return repository.findByMemberIdAndClubBookId(memberId, clubBookId)
        .orElseThrow(() -> new RuntimeException("Club book progress not found"));
  }
}
