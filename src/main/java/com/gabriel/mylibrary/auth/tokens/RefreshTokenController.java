package com.gabriel.mylibrary.auth.tokens;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gabriel.mylibrary.auth.tokens.dtos.RefreshTokenDTO;
import com.gabriel.mylibrary.auth.tokens.services.RefreshTokenService;

import lombok.RequiredArgsConstructor;

/**
 * Admin/internal controller for managing refresh tokens (active device
 * sessions).
 * Endpoints intended for admin use or a "Manage Sessions" screen.
 */
@RestController
@RequestMapping("/auth/sessions")
@RequiredArgsConstructor
public class RefreshTokenController {

  private final RefreshTokenService refreshTokenService;

  /** List all active sessions (admin). */
  @GetMapping
  public ResponseEntity<List<RefreshTokenDTO>> findAll() {
    return ResponseEntity.ok(refreshTokenService.findAll());
  }

  /** Get a specific session by its ID. */
  @GetMapping("/{id}")
  public ResponseEntity<RefreshTokenDTO> findById(@PathVariable UUID id) {
    return ResponseEntity.ok(refreshTokenService.findById(id));
  }

  /** Get an active session by userId + deviceId. */
  @GetMapping("/users/{userId}/devices/{deviceId}")
  public ResponseEntity<RefreshTokenDTO> findByUserAndDevice(
      @PathVariable UUID userId,
      @PathVariable String deviceId) {
    return ResponseEntity.ok(refreshTokenService.findByUserIdAndDeviceId(userId, deviceId));
  }

  /**
   * Revoke a specific session by its token ID (force logout a specific session).
   */
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> revokeById(@PathVariable UUID id) {
    refreshTokenService.deleteById(id);
    return ResponseEntity.noContent().build();
  }

  /** Revoke a specific device session for a user (targeted logout). */
  @DeleteMapping("/users/{userId}/devices/{deviceId}")
  public ResponseEntity<Void> revokeByUserAndDevice(
      @PathVariable UUID userId,
      @PathVariable String deviceId) {
    refreshTokenService.deleteByUserIdAndDeviceId(userId, deviceId);
    return ResponseEntity.noContent().build();
  }
}
