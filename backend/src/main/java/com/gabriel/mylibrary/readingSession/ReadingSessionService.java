package com.gabriel.mylibrary.readingSession;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gabriel.mylibrary.achievement.AchievementEvaluator;
import com.gabriel.mylibrary.books.userBook.UserBookEntity;
import com.gabriel.mylibrary.books.userBook.UserBookRepository;
import com.gabriel.mylibrary.common.errors.ResourceConflictException;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;
import com.gabriel.mylibrary.gamification.ExperienceService;
import com.gabriel.mylibrary.gamification.XpType;
import com.gabriel.mylibrary.readingSession.dtos.CreateReadingSessionDTO;
import com.gabriel.mylibrary.readingSession.dtos.ReadingSessionDTO;
import com.gabriel.mylibrary.readingSession.mappers.ReadingSessionMapper;
import com.gabriel.mylibrary.streak.StreakService;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReadingSessionService {

  private static final int DAILY_STREAK_BONUS_XP = 50;

  private final ReadingSessionRepository readingSessionRepository;
  private final ReadingSessionMapper readingSessionMapper;
  private final UserBookRepository userBookRepository;
  private final EntityManager entityManager;
  private final StreakService streakService;
  private final ExperienceService experienceService;
  private final AchievementEvaluator achievementEvaluator;

  @Transactional(readOnly = true)
  public List<ReadingSessionDTO> findAll(UUID userId) {
    return readingSessionRepository.findAllByUserId(userId).stream()
        .map(readingSessionMapper::toDto)
        .toList();
  }

  @Transactional(readOnly = true)
  public org.springframework.data.domain.Page<ReadingSessionDTO> getHistory(UUID userId,
      org.springframework.data.domain.Pageable pageable) {
    return readingSessionRepository.findAllByUserIdOrderByCreatedAtDesc(userId, pageable)
        .map(readingSessionMapper::toDto);
  }

  @Transactional(readOnly = true)
  public List<ReadingSessionDTO> findAllByUserBook(UUID userBookId, UUID userId) {
    return readingSessionRepository.findAllByUserBookIdAndUserId(userBookId, userId).stream()
        .map(readingSessionMapper::toDto)
        .toList();
  }

  @Transactional
  public ReadingSessionDTO create(UUID userId, CreateReadingSessionDTO dto) {
    UserBookEntity userBook = userBookRepository.findByIdAndUserId(dto.getUserBookId(), userId)
        .orElseThrow(() -> new ResourceNotFoundException("No book found with the provided ID in your library."));

    int totalPages = userBook.getBook().getPages();
    int newPagesRead = Math.min(totalPages, safePagesRead(userBook) + dto.getPagesRead());
    if (dto.getPagesRead() > totalPages) {
      throw new ResourceConflictException(
          "Pages read (" + dto.getPagesRead() + ") exceeds the total page count of this book (" + totalPages + ").");
    }

    ReadingSessionEntity session = readingSessionMapper.toEntity(dto);
    session.setUser(entityManager.getReference(UserEntity.class, userId));
    session.setUserBook(userBook);

    int xpGained = dto.getPagesRead();
    experienceService.rewardActivity(userId, XpType.PAGES_READ, dto.getPagesRead());

    boolean newReadingDay = streakService.recordActivity(userId);
    if (newReadingDay) {
      xpGained += DAILY_STREAK_BONUS_XP;
      experienceService.rewardActivity(userId, XpType.DAILY_STREAK, 0);
    }

    session.setXpGained(xpGained);
    userBook.setPagesRead(newPagesRead);

    ReadingSessionDTO saved = readingSessionMapper.toDto(readingSessionRepository.save(session));

    achievementEvaluator.evaluate(userId);

    return saved;
  }

  @Transactional
  public void delete(UUID id, UUID userId) {
    ReadingSessionEntity session = readingSessionRepository.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResourceNotFoundException("No reading session found with the provided ID."));
    readingSessionRepository.delete(session);
  }

  private int safePagesRead(UserBookEntity userBook) {
    return userBook.getPagesRead() == null ? 0 : userBook.getPagesRead();
  }
}
