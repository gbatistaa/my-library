package com.gabriel.mylibrary.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
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

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;

  @GetMapping("/me")
  public ResponseEntity<UserDTO> getMe(@CookieValue("access_token") String accessToken) {
    UserDTO user = authService.getMe(accessToken);
    return ResponseEntity.ok(user);
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

    AuthResponseDTO authResponse = authService.refresh(dto.getRefreshToken());
    setAccessTokenCookie(response, authResponse);

    return ResponseEntity.ok(authResponse);
  }

  private void setAccessTokenCookie(HttpServletResponse response, AuthResponseDTO authResponse) {
    authResponse.getAccessToken().ifPresent((token) -> {
      Cookie cookie = new Cookie("access_token", token);
      cookie.setHttpOnly(true);
      cookie.setSecure(false); // Change to true in production
      cookie.setPath("/");
      cookie.setMaxAge(24 * 60 * 60);
      response.addCookie(cookie);
    });
  }

  private void clearAccessTokenCookie(HttpServletResponse response) {
    Cookie accessTokenCookie = new Cookie("access_token", null);
    accessTokenCookie.setHttpOnly(true);
    accessTokenCookie.setPath("/");
    accessTokenCookie.setMaxAge(0);
    response.addCookie(accessTokenCookie);
  }
}
