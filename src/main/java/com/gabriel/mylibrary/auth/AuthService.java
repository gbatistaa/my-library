package com.gabriel.mylibrary.auth;

import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.gabriel.mylibrary.auth.dtos.AuthResponseDTO;
import com.gabriel.mylibrary.auth.dtos.LoginDTO;
import com.gabriel.mylibrary.auth.dtos.RegisterDTO;
import com.gabriel.mylibrary.auth.mappers.AuthMapper;
import com.gabriel.mylibrary.auth.tokens.services.JwtService;
import com.gabriel.mylibrary.auth.tokens.services.RefreshTokenService;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;
import com.gabriel.mylibrary.user.UserEntity;
import com.gabriel.mylibrary.user.UserRepository;
import com.gabriel.mylibrary.user.UserService;
import com.gabriel.mylibrary.user.dtos.UserDTO;
import com.gabriel.mylibrary.user.mappers.UserMapper;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

  private final UserService userService;
  private final UserMapper userMapper;
  private final UserRepository userRepository;
  private final JwtService jwtService;
  private final PasswordEncoder passwordEncoder;
  private final RefreshTokenService refreshTokenService;
  private final AuthMapper authMapper;

  @Transactional
  public AuthResponseDTO register(RegisterDTO dto) {
    // Converts RegisterDTO → CreateUserDTO (UserService handles uniqueness
    // validation + password hashing)
    UserDTO createdUser = userService.createUser(dto.toCreateUserDTO());

    String accessToken = jwtService.generateAccessToken(createdUser);
    String refreshToken = jwtService.generateRefreshToken(createdUser);
    refreshTokenService.create(refreshToken, createdUser.getId(), dto.getDeviceId(), dto.getDeviceName());

    return authMapper.toResponse(accessToken, refreshToken);
  }

  @Transactional
  public AuthResponseDTO login(LoginDTO dto) throws ResourceNotFoundException {
    UserEntity userEntity = userRepository.findByUsername(dto.getUsername())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    if (!passwordEncoder.matches(dto.getPassword(), userEntity.getPassword())) {
      throw new IllegalArgumentException("Invalid credentials");
    }

    UserDTO user = userMapper.toDTO(userEntity);

    String accessToken = jwtService.generateAccessToken(user);
    String refreshToken = jwtService.generateRefreshToken(user);

    // If a session for this device already exists, replace it
    if (refreshTokenService.existsByUserId(user.getId())) {
      refreshTokenService.deleteByUserIdAndDeviceId(user.getId(), dto.getDeviceId());
    }
    refreshTokenService.create(refreshToken, user.getId(), dto.getDeviceId(), dto.getDeviceName());

    return authMapper.toResponse(accessToken, refreshToken);
  }

  @Transactional
  public void logout(UUID userId, String deviceId) throws ResourceNotFoundException {
    refreshTokenService.deleteByUserIdAndDeviceId(userId, deviceId);
  }
}
