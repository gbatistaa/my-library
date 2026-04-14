package com.gabriel.mylibrary.auth;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.gabriel.mylibrary.auth.dtos.*;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;
import com.gabriel.mylibrary.common.errors.UnauthorizedException;
import com.gabriel.mylibrary.user.UserEntity;
import com.gabriel.mylibrary.user.UserRepository;
import com.gabriel.mylibrary.user.projections.UserSummary;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;
  private final UserRepository userRepository;

  @GetMapping("/me")
  public ResponseEntity<UserSummary> getMe(@AuthenticationPrincipal UserEntity user) {
    return userRepository.findSummaryById(user.getId())
        .map(ResponseEntity::ok)
        .orElseThrow(() -> new ResourceNotFoundException("Authenticated user profile could not be found."));
  }

  @PostMapping("/register")
  public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterDTO dto, HttpServletResponse response)
      throws ResourceNotFoundException, UnauthorizedException {
    AuthResponseDTO authResponse = authService.register(dto);
    setAccessTokenCookie(response, authResponse);
    return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
  }

  @PostMapping("/login")
  public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginDTO dto, HttpServletResponse response)
      throws ResourceNotFoundException, UnauthorizedException {
    AuthResponseDTO authResponse = authService.login(dto);
    setAccessTokenCookie(response, authResponse);
    return ResponseEntity.ok(authResponse);
  }

  @DeleteMapping("/logout")
  public ResponseEntity<Void> logout(
      @AuthenticationPrincipal UserEntity user,
      @RequestParam String deviceId,
      HttpServletResponse response) throws ResourceNotFoundException, UnauthorizedException {

    authService.logout(user.getId(), deviceId);
    clearAccessTokenCookie(response);

    return ResponseEntity.noContent().build();
  }

  @PostMapping("/refresh")
  public ResponseEntity<AuthResponseDTO> refresh(
      @Valid @RequestBody RefreshRequestDTO dto,
      HttpServletResponse response) throws ResourceNotFoundException, UnauthorizedException {

    AuthResponseDTO authResponse = authService.refresh(dto.getUserId(), dto.getDeviceId());
    setAccessTokenCookie(response, authResponse);

    return ResponseEntity.ok(authResponse);
  }

  private void setAccessTokenCookie(HttpServletResponse response, AuthResponseDTO authResponse)
      throws ResourceNotFoundException, UnauthorizedException {
    String token = authResponse.getAccessToken();
    if (token != null && !token.isEmpty()) {
      ResponseCookie cookie = ResponseCookie
          .from("access_token", token)
          .httpOnly(true)
          .secure(false) // Change to true in production (HTTPS)
          .path("/")
          .maxAge(24 * 60 * 60)
          .sameSite("Lax") // Technique 1: Protection against CSRF
          .build();
      response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
  }

  private void clearAccessTokenCookie(HttpServletResponse response)
      throws ResourceNotFoundException, UnauthorizedException {
    ResponseCookie cookie = ResponseCookie.from("access_token", "")
        .httpOnly(true)
        .path("/")
        .maxAge(0)
        .sameSite("Lax")
        .build();
    response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
  }
}
