package com.gabriel.mylibrary.saga;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gabriel.mylibrary.books.userBook.UserBookEntity;
import com.gabriel.mylibrary.books.userBook.UserBookRepository;
import com.gabriel.mylibrary.books.userBook.dtos.UserBookDTO;
import com.gabriel.mylibrary.books.userBook.mappers.UserBookMapper;
import com.gabriel.mylibrary.common.enums.BookStatus;
import com.gabriel.mylibrary.common.errors.ResourceConflictException;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;
import com.gabriel.mylibrary.saga.dtos.CreateSagaDTO;
import com.gabriel.mylibrary.saga.dtos.SagaDTO;
import com.gabriel.mylibrary.saga.dtos.UpdateSagaDTO;
import com.gabriel.mylibrary.saga.mappers.SagaMapper;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SagaService {

  private final SagaRepository sagaRepository;
  private final EntityManager entityManager;
  private final SagaMapper sagaMapper;
  private final UserBookRepository userBookRepository;
  private final UserBookMapper userBookMapper;

  @Transactional(readOnly = true)
  public List<SagaDTO> findAllByUserId(UUID userId) {
    Map<UUID, Integer> bookCounts = sagaRepository.countBooksBySagaIdForUser(userId).stream()
        .collect(Collectors.toMap(
            row -> (UUID) row[0],
            row -> ((Long) row[1]).intValue()));

    return sagaRepository.findAllByUserId(userId).stream()
        .map(entity -> {
          SagaDTO dto = sagaMapper.toDto(entity);
          dto.setBookCount(bookCounts.getOrDefault(entity.getId(), 0));
          return dto;
        })
        .toList();
  }

  @Transactional(readOnly = true)
  public SagaDTO findOne(UUID id, UUID userId) {
    return sagaRepository.findByIdAndUserId(id, userId)
        .map(sagaMapper::toDto)
        .orElseThrow(() -> new ResourceNotFoundException("No saga found with the provided ID."));
  }

  @Transactional(readOnly = true)
  public List<UserBookDTO> getBooks(UUID sagaId, UUID userId) {
    SagaEntity sagaEntity = sagaRepository.findByIdAndUserId(sagaId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("No saga found with the provided ID."));

    return sagaEntity.getUserBooks().stream()
        .map(userBookMapper::toDto)
        .toList();
  }

  @Transactional
  public SagaDTO create(UUID userId, CreateSagaDTO dto) {
    if (sagaRepository.existsByNameAndUserId(dto.getName(), userId)) {
      throw new ResourceConflictException("A saga named '" + dto.getName() + "' already exists in your library.");
    }

    SagaEntity sagaEntity = sagaMapper.toEntity(dto);
    sagaEntity.setUser(entityManager.getReference(UserEntity.class, userId));

    return sagaMapper.toDto(sagaRepository.save(sagaEntity));
  }

  @Transactional
  public SagaDTO update(UUID id, UpdateSagaDTO dto, UUID userId) {
    SagaEntity sagaEntity = sagaRepository.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResourceNotFoundException("No saga found with the provided ID."));

    sagaMapper.updateEntityFromDto(dto, sagaEntity);

    return sagaMapper.toDto(sagaRepository.save(sagaEntity));
  }

  @Transactional
  public SagaDTO addUserBookToSaga(UUID sagaId, UUID userBookId, UUID userId) {
    SagaEntity sagaEntity = sagaRepository.findByIdAndUserId(sagaId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("No saga found with the provided ID."));

    UserBookEntity userBook = userBookRepository.findByIdAndUserId(userBookId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("No book found with the provided ID in your library."));

    sagaEntity.addUserBook(userBook);

    return sagaMapper.toDto(sagaEntity);
  }

  @Transactional
  public void removeUserBookFromSaga(UUID sagaId, UUID userBookId, UUID userId) {
    SagaEntity sagaEntity = sagaRepository.findByIdAndUserId(sagaId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("No saga found with the provided ID."));

    UserBookEntity userBook = userBookRepository.findByIdAndUserId(userBookId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("No book found with the provided ID in your library."));

    sagaEntity.removeUserBook(userBook);
  }

  @Transactional(readOnly = true)
  public double getProgress(UUID sagaId, UUID userId) {
    if (sagaRepository.findByIdAndUserId(sagaId, userId).isEmpty()) {
      throw new ResourceNotFoundException("No saga found with the provided ID.");
    }

    long totalBooks = sagaRepository.countBooksBySagaId(sagaId);
    long completedBooks = sagaRepository.countBooksBySagaIdAndStatus(sagaId, BookStatus.COMPLETED);

    return totalBooks == 0 ? 0 : (double) completedBooks / totalBooks * 100;
  }

  @Transactional
  public void delete(UUID id, UUID userId) {
    SagaEntity sagaEntity = sagaRepository.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResourceNotFoundException("No saga found with the provided ID."));

    sagaRepository.delete(sagaEntity);
  }
}
