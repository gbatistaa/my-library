package com.gabriel.mylibrary.saga;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gabriel.mylibrary.books.BookEntity;
import com.gabriel.mylibrary.books.BookRepository;
import com.gabriel.mylibrary.books.dtos.BookDTO;
import com.gabriel.mylibrary.books.mappers.BookMapper;
import com.gabriel.mylibrary.common.enums.BookStatus;
import com.gabriel.mylibrary.common.errors.ResourceConflictException;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;
import com.gabriel.mylibrary.saga.dtos.CreateSagaDTO;
import com.gabriel.mylibrary.saga.dtos.SagaDTO;
import com.gabriel.mylibrary.saga.dtos.UpdateSagaDTO;
import com.gabriel.mylibrary.saga.mappers.SagaMapper;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.persistence.EntityManager;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

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
    return sagaRepository.findAllByUserId(userId)
        .stream()
        .map(sagaMapper::toDto)
        .toList();
  }

  @Transactional(readOnly = true)
  public SagaDTO findOne(UUID id, UUID userId) throws ResourceNotFoundException {
    return sagaRepository.findByIdAndUserId(id, userId)
        .map(sagaMapper::toDto)
        .orElseThrow(() -> new ResourceNotFoundException("Saga not found with id: " + id));
  }

  @Transactional(readOnly = true)
  public List<BookDTO> getBooks(UUID sagaId, UUID userId) throws ResourceNotFoundException {
    SagaEntity saga = sagaRepository.findByIdAndUserId(sagaId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Saga not found with id: " + sagaId));

    return saga.getBooks().stream()
        .map(bookMapper::toDto)
        .toList();
  }

  @Transactional
  public SagaDTO create(UUID userId, @Valid CreateSagaDTO dto) {
    if (sagaRepository.existsByNameAndUserId(dto.getName(), userId)) {
      throw new ResourceConflictException("Saga with this name already exists: " + dto.getName());
    }

    SagaEntity saga = sagaMapper.toEntity(dto);
    saga.setUser(entityManager.getReference(UserEntity.class, userId));

    return sagaMapper.toDto(sagaRepository.save(saga));
  }

  @Transactional
  public SagaDTO update(UUID id, @Valid UpdateSagaDTO dto, UUID userId) throws ResourceNotFoundException {
    SagaEntity saga = sagaRepository.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Saga not found with id: " + id));

    sagaMapper.updateEntityFromDto(dto, saga);

    return sagaMapper.toDto(sagaRepository.save(saga));
  }

  @Transactional
  public SagaDTO addBookToSaga(UUID sagaId, UUID bookId, UUID userId) throws ResourceNotFoundException {
    SagaEntity saga = sagaRepository.findByIdAndUserId(sagaId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Saga not found with id: " + sagaId));

    BookEntity book = bookRepository.findByIdAndUserId(bookId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));

    saga.addBook(book);

    return sagaMapper.toDto(saga);
  }

  @Transactional
  public void removeBookFromSaga(UUID sagaId, UUID bookId, UUID userId) throws ResourceNotFoundException {
    SagaEntity saga = sagaRepository.findByIdAndUserId(sagaId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Saga not found with id: " + sagaId));

    BookEntity book = bookRepository.findByIdAndUserId(bookId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));

    saga.removeBook(book);
  }

  @Transactional(readOnly = true)
  public double getProgress(UUID sagaId, UUID userId) throws ResourceNotFoundException {
    SagaEntity saga = sagaRepository.findByIdAndUserId(sagaId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Saga not found with id: " + sagaId));

    int totalBooks = saga.getBooks().size();
    int completedBooks = (int) saga.getBooks().stream()
        .filter(book -> book.getStatus() == BookStatus.COMPLETED)
        .count();

    double progress = totalBooks == 0 ? 0 : (double) completedBooks / totalBooks * 100;

    return progress;
  }

  @Transactional
  public void delete(UUID id, UUID userId) throws ResourceNotFoundException {
    SagaEntity saga = sagaRepository.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Saga not found with id: " + id));

    sagaRepository.delete(saga);
  }

}
