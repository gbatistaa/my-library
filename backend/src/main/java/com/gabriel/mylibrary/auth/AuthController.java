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
