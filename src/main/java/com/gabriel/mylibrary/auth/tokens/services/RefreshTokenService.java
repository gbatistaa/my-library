package com.gabriel.mylibrary.auth.tokens;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gabriel.mylibrary.auth.tokens.dtos.CreateRefreshTokenDTO;
import com.gabriel.mylibrary.auth.tokens.dtos.RefreshTokenDTO;
import com.gabriel.mylibrary.auth.tokens.mappers.RefreshTokenMapper;
import com.gabriel.mylibrary.common.errors.ResourceConflictException;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

  private final RefreshTokenRepository refreshTokenRepository;
  private final RefreshTokenMapper refreshTokenMapper;

  @Transactional(readOnly = true)
  public List<RefreshTokenDTO> findAll() {
    return refreshTokenRepository.findAll()
        .stream()
        .map(refreshTokenMapper::toDTO)
        .toList();
  }

  @Transactional(readOnly = true)
  public RefreshTokenDTO findById(UUID id) throws ResourceNotFoundException {
    return refreshTokenRepository.findById(id)
        .map(refreshTokenMapper::toDTO)
        .orElseThrow(() -> new ResourceNotFoundException("Refresh token not found with id: " + id));
  }

  @Transactional(readOnly = true)
  public RefreshTokenDTO findByUserId(UUID userId) throws ResourceNotFoundException {
    return refreshTokenRepository.findByUserId(userId)
        .map(refreshTokenMapper::toDTO)
        .orElseThrow(() -> new ResourceNotFoundException("Refresh token not found for user id: " + userId));
  }

  @Transactional
  public RefreshTokenDTO create(CreateRefreshTokenDTO dto) throws ResourceConflictException {
    if (refreshTokenRepository.existsByUserId(dto.getUserId())) {
      throw new ResourceConflictException("A refresh token already exists for user id: " + dto.getUserId());
    }

    RefreshTokenEntity entity = refreshTokenMapper.toEntity(dto);
    RefreshTokenEntity saved = refreshTokenRepository.save(entity);
    return refreshTokenMapper.toDTO(saved);
  }

  @Transactional
  public void deleteById(UUID id) throws ResourceNotFoundException {
    if (!refreshTokenRepository.existsById(id)) {
      throw new ResourceNotFoundException("Refresh token not found with id: " + id);
    }
    refreshTokenRepository.deleteById(id);
  }

  @Transactional
  public void deleteByUserId(UUID userId) throws ResourceNotFoundException {
    RefreshTokenEntity entity = refreshTokenRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Refresh token not found for user id: " + userId));
    refreshTokenRepository.delete(entity);
  }
}
