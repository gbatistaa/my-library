package com.gabriel.mylibrary.books.userBook;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gabriel.mylibrary.achievement.AchievementEvaluator;
import com.gabriel.mylibrary.books.BookEntity;
import com.gabriel.mylibrary.books.BookService;
import com.gabriel.mylibrary.books.dtos.BookAuthorDTO;
import com.gabriel.mylibrary.books.userBook.dtos.AddToLibraryDTO;
import com.gabriel.mylibrary.books.userBook.dtos.UpdateUserBookDTO;
import com.gabriel.mylibrary.books.userBook.dtos.UserBookDTO;
import com.gabriel.mylibrary.books.userBook.mappers.UserBookMapper;
import com.gabriel.mylibrary.books.userBook.projections.UserBookSummary;
import com.gabriel.mylibrary.common.enums.BookStatus;
import com.gabriel.mylibrary.common.errors.ResourceConflictException;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;
import com.gabriel.mylibrary.gamification.ExperienceService;
import com.gabriel.mylibrary.gamification.XpType;
import com.gabriel.mylibrary.saga.SagaEntity;
import com.gabriel.mylibrary.saga.SagaRepository;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserBookService {

  private final UserBookRepository userBookRepository;
  private final UserBookMapper userBookMapper;
  private final BookService bookService;
  private final SagaRepository sagaRepository;
  private final EntityManager entityManager;
  private final ExperienceService experienceService;
  private final AchievementEvaluator achievementEvaluator;

  @Transactional(readOnly = true)
  public Page<UserBookSummary> findAll(UUID userId, Pageable pageable) {
    return userBookRepository.findSummariesByUserId(userId, pageable);
  }

  @Transactional(readOnly = true)
  public Page<UserBookDTO> findWithFilters(UUID userId, BookStatus status, Integer minRating,
      String category, String author, Integer year, Pageable pageable) {
    return userBookRepository
        .findAll(UserBookSpecification.withFilters(userId, status, minRating, category, author, year), pageable)
        .map(userBookMapper::toDto);
  }

  @Transactional(readOnly = true)
  public Page<UserBookSummary> findByTitle(String title, UUID userId, Pageable pageable) {
    if (title == null || title.isBlank()) {
      return findAll(userId, pageable);
    }
    return userBookRepository.findSummariesByUserIdAndTitle(userId, title, pageable);
  }

  @Transactional(readOnly = true)
  public UserBookDTO findOne(UUID id, UUID userId) {
    return userBookRepository.findByIdAndUserId(id, userId)
        .map(userBookMapper::toDto)
        .orElseThrow(() -> new ResourceNotFoundException("No book found with the provided ID in your library."));
  }

  @Transactional
  public UserBookDTO addToLibrary(AddToLibraryDTO dto, UUID userId) {
    if (userBookRepository.existsByUserIdAndBookGoogleBooksId(userId, dto.getGoogleBooksId())) {
      throw new ResourceConflictException("This book is already in your library.");
    }

    BookEntity book = bookService.findOrFetchByGoogleBooksId(dto.getGoogleBooksId());

    UserBookEntity entity = userBookMapper.toEntity(dto);
    entity.setUser(entityManager.getReference(UserEntity.class, userId));
    entity.setBook(book);
    entity.setSaga(resolveSaga(dto.getSagaId(), userId));
    if (entity.getPagesRead() == null) {
      entity.setPagesRead(0);
    }

    validateDates(entity.getStartDate(), entity.getFinishDate());
    validatePagesRead(entity.getPagesRead(), book.getPages());
    validateRatingForStatus(entity.getStatus(), entity.getRating());

    if (entity.getStatus() == BookStatus.COMPLETED) {
      applyCompletionDefaults(entity, book);
    }

    UserBookEntity saved = userBookRepository.save(entity);

    if (saved.getStatus() == BookStatus.COMPLETED) {
      experienceService.rewardActivity(userId, XpType.BOOK_COMPLETED, 0);
    }
    achievementEvaluator.evaluate(userId);

    return userBookMapper.toDto(saved);
  }

  @Transactional
  public UserBookDTO updateUserState(UUID id, UUID userId, UpdateUserBookDTO dto) {
    UserBookEntity entity = userBookRepository.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResourceNotFoundException("No book found with the provided ID in your library."));

    BookStatus previousStatus = entity.getStatus();
    userBookMapper.updateEntityFromDto(dto, entity);

    if (dto.getSagaId() != null) {
      entity.setSaga(resolveSaga(dto.getSagaId(), userId));
    }

    validateDates(entity.getStartDate(), entity.getFinishDate());
    validatePagesRead(entity.getPagesRead(), entity.getBook().getPages());
    validateRatingForStatus(entity.getStatus(), entity.getRating());

    if (entity.getStatus() == BookStatus.COMPLETED) {
      applyCompletionDefaults(entity, entity.getBook());
    }

    UserBookEntity saved = userBookRepository.save(entity);

    if (saved.getStatus() == BookStatus.COMPLETED && previousStatus != BookStatus.COMPLETED) {
      experienceService.rewardActivity(userId, XpType.BOOK_COMPLETED, 0);
    }
    achievementEvaluator.evaluate(userId);

    return userBookMapper.toDto(saved);
  }

  @Transactional
  public UserBookDTO resetForReread(UUID id, UUID userId) {
    UserBookEntity entity = userBookRepository.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResourceNotFoundException("No book found with the provided ID in your library."));

    if (entity.getStatus() != BookStatus.COMPLETED) {
      throw new ResourceConflictException("Only books with a 'COMPLETED' status can be reset for re-reading.");
    }

    entity.setStatus(BookStatus.READING);
    entity.setPagesRead(0);
    entity.setRating(null);
    entity.setFinishDate(null);
    entity.setStartDate(LocalDate.now());

    UserBookEntity saved = userBookRepository.save(entity);
    achievementEvaluator.evaluate(userId);
    return userBookMapper.toDto(saved);
  }

  @Transactional
  public void removeFromLibrary(UUID id, UUID userId) {
    UserBookEntity entity = userBookRepository.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResourceNotFoundException("No book found with the provided ID in your library."));
    userBookRepository.delete(entity);
  }

  @Transactional(readOnly = true)
  public List<BookAuthorDTO> getAuthors(UUID userId) {
    return userBookRepository.countBooksByAuthor(userId).stream()
        .map(row -> new BookAuthorDTO((String) row[0], (Long) row[1]))
        .toList();
  }

  private SagaEntity resolveSaga(UUID sagaId, UUID userId) {
    if (sagaId == null) {
      return null;
    }
    return sagaRepository.findByIdAndUserId(sagaId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Saga not found or does not belong to this user."));
  }

  private void validateDates(LocalDate startDate, LocalDate finishDate) {
    if (startDate != null && finishDate != null && finishDate.isBefore(startDate)) {
      throw new ResourceConflictException("The finish date cannot be set before the start date.");
    }
  }

  private void validatePagesRead(Integer pagesRead, Integer totalPages) {
    if (pagesRead != null && totalPages != null && pagesRead > totalPages) {
      throw new ResourceConflictException("The number of pages read cannot exceed the total page count of the book.");
    }
  }

  private void validateRatingForStatus(BookStatus status, Integer rating) {
    if (status == BookStatus.COMPLETED && rating == null) {
      throw new ResourceConflictException("A rating is required when marking a book as completed.");
    }
    if (status != BookStatus.COMPLETED && rating != null) {
      throw new ResourceConflictException("A rating can only be assigned to books with a 'COMPLETED' status.");
    }
  }

  private void applyCompletionDefaults(UserBookEntity entity, BookEntity book) {
    entity.setPagesRead(book.getPages());
    if (entity.getFinishDate() == null) {
      entity.setFinishDate(LocalDate.now());
    }
  }
}
