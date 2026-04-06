package com.gabriel.mylibrary.saga;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gabriel.mylibrary.books.BookEntity;
import com.gabriel.mylibrary.books.BookRepository;
import com.gabriel.mylibrary.books.mappers.BookMapper;
import com.gabriel.mylibrary.books.projections.BookSummary;
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
  private final BookRepository bookRepository;
  private final BookMapper bookMapper;

  @Transactional(readOnly = true)
  public List<SagaDTO> findAllByUserId(UUID userId) {
    Map<UUID, Integer> bookCounts = sagaRepository.countBooksBySagaIdForUser(userId).stream()
        .collect(Collectors.toMap(
            row -> (UUID) row[0],
            row -> ((Long) row[1]).intValue()
        ));

    return sagaRepository.findAllByUserId(userId).stream()
        .map(entity -> {
          SagaDTO dto = sagaMapper.toDto(entity);
          dto.setBookCount(bookCounts.getOrDefault(entity.getId(), 0));
          return dto;
        })
        .toList();
  }

  @Transactional(readOnly = true)
  public SagaDTO findOne(UUID id, UUID userId) throws ResourceNotFoundException {
    return sagaRepository.findByIdAndUserId(id, userId)
        .map(sagaMapper::toDto)
        .orElseThrow(() -> new ResourceNotFoundException("Saga not found with id: " + id));
  }

  @Transactional(readOnly = true)
  public List<BookSummary> getBooks(UUID sagaId, UUID userId) throws ResourceNotFoundException {
    SagaEntity sagaEntity = sagaRepository.findByIdAndUserId(sagaId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Saga not found with id: " + sagaId));

    return sagaEntity.getBooks().stream()
        .map(bookMapper::toSummaryDto)
        .collect(Collectors.toList());
  }

  @Transactional
  public SagaDTO create(UUID userId, CreateSagaDTO dto) {
    if (sagaRepository.existsByNameAndUserId(dto.getName(), userId)) {
      throw new ResourceConflictException("Saga with this name already exists: " + dto.getName());
    }

    SagaEntity sagaEntity = sagaMapper.toEntity(dto);
    sagaEntity.setUser(entityManager.getReference(UserEntity.class, userId));

    return sagaMapper.toDto(sagaRepository.save(sagaEntity));
  }

  @Transactional
  public SagaDTO update(UUID id, UpdateSagaDTO dto, UUID userId) throws ResourceNotFoundException {
    SagaEntity sagaEntity = sagaRepository.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Saga not found with id: " + id));

    sagaMapper.updateEntityFromDto(dto, sagaEntity);

    return sagaMapper.toDto(sagaRepository.save(sagaEntity));
  }

  @Transactional
  public SagaDTO addBookToSaga(UUID sagaId, UUID bookId, UUID userId) throws ResourceNotFoundException {
    SagaEntity sagaEntity = sagaRepository.findByIdAndUserId(sagaId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Saga not found with id: " + sagaId));

    BookEntity book = bookRepository.findByIdAndUserId(bookId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));

    sagaEntity.addBook(book);

    return sagaMapper.toDto(sagaEntity);
  }

  @Transactional
  public void removeBookFromSaga(UUID sagaId, UUID bookId, UUID userId) throws ResourceNotFoundException {
    SagaEntity sagaEntity = sagaRepository.findByIdAndUserId(sagaId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Saga not found with id: " + sagaId));

    BookEntity book = bookRepository.findByIdAndUserId(bookId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));

    sagaEntity.removeBook(book);
  }

  @Transactional(readOnly = true)
  public double getProgress(UUID sagaId, UUID userId) throws ResourceNotFoundException {
    if (sagaRepository.findByIdAndUserId(sagaId, userId).isEmpty()) {
      throw new ResourceNotFoundException("Saga not found with id: " + sagaId);
    }

    long totalBooks = sagaRepository.countBooksBySagaId(sagaId);
    long completedBooks = sagaRepository.countBooksBySagaIdAndStatus(sagaId, BookStatus.COMPLETED);

    return totalBooks == 0 ? 0 : (double) completedBooks / totalBooks * 100;
  }

  @Transactional
  public void delete(UUID id, UUID userId) throws ResourceNotFoundException {
    SagaEntity sagaEntity = sagaRepository.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Saga not found with id: " + id));

    sagaRepository.delete(sagaEntity);
  }
}
