package com.gabriel.mylibrary.auth;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gabriel.mylibrary.auth.dtos.AuthResponseDTO;
import com.gabriel.mylibrary.auth.dtos.LoginDTO;
import com.gabriel.mylibrary.auth.dtos.RegisterDTO;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;

  @PostMapping("/register")
  public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterDTO dto) {
    AuthResponseDTO response = authService.register(dto);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @PostMapping("/login")
  public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginDTO dto) {
    AuthResponseDTO response = authService.login(dto);
    return ResponseEntity.ok(response);
  }

  /**
   * DELETE /auth/logout
   * Revokes the session for the authenticated user and device.
   * Note: userId should be grabbed from @AuthenticationPrincipal once JWT filter
   * is active.
   */
  @DeleteMapping("/logout")
  public ResponseEntity<Void> logout(
      @RequestParam UUID userId,
      @RequestParam String deviceId) {
    authService.logout(userId, deviceId);
    return ResponseEntity.noContent().build();
  }
}
