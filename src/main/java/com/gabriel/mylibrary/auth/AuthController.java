package com.gabriel.mylibrary.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gabriel.mylibrary.auth.dtos.AuthResponseDTO;
import com.gabriel.mylibrary.auth.dtos.LoginDTO;
import com.gabriel.mylibrary.auth.dtos.RefreshRequestDTO;
import com.gabriel.mylibrary.auth.dtos.RegisterDTO;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;
import com.gabriel.mylibrary.common.errors.UnauthorizedException;
import com.gabriel.mylibrary.user.UserEntity;
import com.gabriel.mylibrary.user.dtos.UserDTO;
import com.gabriel.mylibrary.user.mappers.UserMapper;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;
  private final UserMapper userMapper;

  @GetMapping("/me")
  public ResponseEntity<UserDTO> getMe(@AuthenticationPrincipal UserEntity user) {
    UserDTO userDTO = userMapper.toDTO(user);
    return ResponseEntity.ok(userDTO);
  }

  @PostMapping("/register")
  public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterDTO dto, HttpServletResponse response) {
    AuthResponseDTO authResponse = authService.register(dto);
    setAccessTokenCookie(response, authResponse);
    return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
  }

  @PostMapping("/login")
  public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginDTO dto, HttpServletResponse response) {
    AuthResponseDTO authResponse = authService.login(dto);
    setAccessTokenCookie(response, authResponse);
    return ResponseEntity.ok(authResponse);
  }

  @DeleteMapping("/logout")
  public ResponseEntity<Void> logout(
      @AuthenticationPrincipal UserEntity user,
      @RequestParam String deviceId,
      HttpServletResponse response) {

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

  private void setAccessTokenCookie(HttpServletResponse response, AuthResponseDTO authResponse) {
    String token = authResponse.getAccessToken();
    if (token != null && !token.isEmpty()) {
      org.springframework.http.ResponseCookie cookie = org.springframework.http.ResponseCookie
          .from("access_token", token)
          .httpOnly(true)
          .secure(false) // Change to true in production (HTTPS)
          .path("/")
          .maxAge(24 * 60 * 60)
          .sameSite("Lax") // Technique 1: Protection against CSRF
          .build();
      response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString());
    }
  }

  private void clearAccessTokenCookie(HttpServletResponse response) {
    org.springframework.http.ResponseCookie cookie = org.springframework.http.ResponseCookie.from("access_token", "")
        .httpOnly(true)
        .path("/")
        .maxAge(0)
        .sameSite("Lax")
        .build();
    response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString());
  }
}
