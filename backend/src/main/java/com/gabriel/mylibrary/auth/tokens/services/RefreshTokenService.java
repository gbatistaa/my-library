package com.gabriel.mylibrary.auth.tokens.services;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gabriel.mylibrary.auth.tokens.RefreshTokenEntity;
import com.gabriel.mylibrary.auth.tokens.RefreshTokenRepository;
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
  public List<RefreshTokenDTO> findAllByUserId(UUID userId) {
    return refreshTokenRepository.findAllByUserId(userId)
        .stream()
        .map(refreshTokenMapper::toDTO)
        .toList();
  }

  @Transactional(readOnly = true)
  public RefreshTokenDTO findById(UUID id) throws ResourceNotFoundException {
    return refreshTokenRepository.findById(id)
        .map(refreshTokenMapper::toDTO)
        .orElseThrow(() -> new ResourceNotFoundException("No active refresh token found for the provided ID."));
  }

  @Transactional(readOnly = true)
  public RefreshTokenDTO findByUserIdAndDeviceId(UUID userId, String deviceId) throws ResourceNotFoundException {
    return refreshTokenRepository.findByUserIdAndDeviceId(userId, deviceId)
        .map(refreshTokenMapper::toDTO)
        .orElseThrow(() -> new ResourceNotFoundException("No active session found for this user and device. Please log in again."));
  }

  @Transactional(readOnly = true)
  public boolean existsByUserIdAndDeviceId(UUID userId, String deviceId) {
    return refreshTokenRepository.existsByUserIdAndDeviceId(userId, deviceId);
  }

  @Transactional
  public RefreshTokenDTO create(String token, UUID userId, String deviceId, String deviceName)
      throws ResourceConflictException {

    if (refreshTokenRepository.existsByUserIdAndDeviceId(userId, deviceId)) {
      throw new ResourceConflictException("An active session already exists for this device. Please log out before creating a new one.");
    }

    Instant expirationDate = Instant.now().plus(7, ChronoUnit.DAYS);
    CreateRefreshTokenDTO dto = new CreateRefreshTokenDTO(userId, token, expirationDate, deviceId, deviceName);

    RefreshTokenEntity entity = refreshTokenMapper.toEntity(dto);
    RefreshTokenEntity saved = refreshTokenRepository.save(entity);
    return refreshTokenMapper.toDTO(saved);
  }

  @Transactional
  public void deleteById(UUID id) throws ResourceNotFoundException {
    if (!refreshTokenRepository.existsById(id)) {
      throw new ResourceNotFoundException("No active refresh token found for the provided ID.");
    }
    refreshTokenRepository.deleteById(id);
  }

  @Transactional
  public void deleteByUserIdAndDeviceId(UUID userId, String deviceId) throws ResourceNotFoundException {
    RefreshTokenEntity entity = refreshTokenRepository.findByUserIdAndDeviceId(userId, deviceId)
        .orElseThrow(() -> new ResourceNotFoundException("No active session found for this user and device. Please log in again."));
    refreshTokenRepository.delete(entity);
  }
}
