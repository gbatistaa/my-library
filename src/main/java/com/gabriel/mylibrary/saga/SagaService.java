package com.gabriel.mylibrary.saga;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
  public void delete(UUID id, UUID userId) throws ResourceNotFoundException {
    SagaEntity saga = sagaRepository.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Saga not found with id: " + id));

    sagaRepository.delete(saga);
  }

}
