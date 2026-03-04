package com.gabriel.mylibrary.auth.tokens;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gabriel.mylibrary.auth.tokens.dtos.CreateRefreshTokenDTO;
import com.gabriel.mylibrary.auth.tokens.dtos.RefreshTokenDTO;
import com.gabriel.mylibrary.auth.tokens.services.RefreshTokenService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth/refresh")
@RequiredArgsConstructor
public class RefreshTokenController {

  private final RefreshTokenService refreshTokenService;

  @GetMapping
  public ResponseEntity<List<RefreshTokenDTO>> findAll() {
    return ResponseEntity.ok(refreshTokenService.findAll());
  }

  @GetMapping("/{id}")
  public ResponseEntity<RefreshTokenDTO> findById(@PathVariable UUID id) {
    return ResponseEntity.ok(refreshTokenService.findById(id));
  }

  @GetMapping("/user/{userId}")
  public ResponseEntity<RefreshTokenDTO> findByUserId(@PathVariable UUID userId) {
    return ResponseEntity.ok(refreshTokenService.findByUserId(userId));
  }

  @PostMapping
  public ResponseEntity<RefreshTokenDTO> create(@Valid @RequestBody CreateRefreshTokenDTO dto) {
    return ResponseEntity.status(HttpStatus.CREATED).body(refreshTokenService.create(dto));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteById(@PathVariable UUID id) {
    refreshTokenService.deleteById(id);
    return ResponseEntity.noContent().build();
  }

  @DeleteMapping("/user/{userId}")
  public ResponseEntity<Void> deleteByUserId(@PathVariable UUID userId) {
    refreshTokenService.deleteByUserId(userId);
    return ResponseEntity.noContent().build();
  }
}
