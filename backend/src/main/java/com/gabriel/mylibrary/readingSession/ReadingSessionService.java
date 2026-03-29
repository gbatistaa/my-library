package com.gabriel.mylibrary.readingSession;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gabriel.mylibrary.books.BookEntity;
import com.gabriel.mylibrary.books.BookRepository;
import com.gabriel.mylibrary.common.errors.ResourceConflictException;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;
import com.gabriel.mylibrary.readingSession.dtos.CreateReadingSessionDTO;
import com.gabriel.mylibrary.readingSession.dtos.ReadingSessionDTO;
import com.gabriel.mylibrary.readingSession.mappers.ReadingSessionMapper;
import com.gabriel.mylibrary.achievement.AchievementEvaluator;
import com.gabriel.mylibrary.streak.StreakService;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReadingSessionService {

  private final ReadingSessionRepository readingSessionRepository;
  private final ReadingSessionMapper readingSessionMapper;
  private final BookRepository bookRepository;
  private final EntityManager entityManager;
  private final StreakService streakService;
  private final AchievementEvaluator achievementEvaluator;

  @Transactional(readOnly = true)
  public List<ReadingSessionDTO> findAll(UUID userId) {
    return readingSessionRepository.findAllByUserId(userId).stream()
        .map(readingSessionMapper::toDto)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<ReadingSessionDTO> findAllByBook(UUID bookId, UUID userId) {
    return readingSessionRepository.findAllByBookIdAndUserId(bookId, userId).stream()
        .map(readingSessionMapper::toDto)
        .toList();
  }

  @Transactional
  public ReadingSessionDTO create(UUID userId, CreateReadingSessionDTO dto)
      throws ResourceNotFoundException, ResourceConflictException {
    BookEntity book = bookRepository.findByIdAndUserId(dto.getBookId(), userId)
        .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + dto.getBookId()));

    if (dto.getPagesRead() > book.getPages()) {
      throw new ResourceConflictException(
          "Pages read cannot be greater than the total number of pages in the book (" + book.getPages() + ")");
    }

    ReadingSessionEntity session = readingSessionMapper.toEntity(dto);

    UserEntity userRef = entityManager.getReference(UserEntity.class, userId);
    session.setUser(userRef);
    session.setBook(book);

    ReadingSessionDTO saved = readingSessionMapper.toDto(readingSessionRepository.save(session));

    // Update streak engine & evaluate achievements
    streakService.recordActivity(userId);
    achievementEvaluator.evaluate(userId);

    return saved;
  }

  @Transactional
  public void delete(UUID id, UUID userId) throws ResourceNotFoundException {
    ReadingSessionEntity session = readingSessionRepository.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Reading session not found with id: " + id));
    readingSessionRepository.delete(session);
  }
}
