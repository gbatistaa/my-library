package com.gabriel.mylibrary.auth;

import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.gabriel.mylibrary.auth.dtos.AuthResponseDTO;
import com.gabriel.mylibrary.auth.dtos.LoginDTO;
import com.gabriel.mylibrary.auth.dtos.RegisterDTO;
import com.gabriel.mylibrary.auth.mappers.AuthMapper;
import com.gabriel.mylibrary.auth.tokens.RefreshTokenEntity;
import com.gabriel.mylibrary.auth.tokens.RefreshTokenRepository;
import com.gabriel.mylibrary.auth.tokens.services.JwtService;
import com.gabriel.mylibrary.auth.tokens.services.RefreshTokenService;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;
import com.gabriel.mylibrary.common.errors.UnauthorizedException;
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
  private final RefreshTokenRepository refreshTokenRepository;

  @Transactional
  public AuthResponseDTO register(RegisterDTO dto) {
    UserDTO createdUser = userService.createUser(dto.toCreateUserDTO());

    if (createdUser == null) {
      throw new IllegalArgumentException("User registration failed. Please verify your data and try again.");
    }

    if (refreshTokenService.existsByUserIdAndDeviceId(createdUser.getId(), dto.getDeviceId())) {
      refreshTokenService.deleteByUserIdAndDeviceId(createdUser.getId(), dto.getDeviceId());
    }

    System.out.println("User created: " + createdUser);
    System.out.println("Device ID: " + dto.getDeviceId());
    System.out.println("Device Name: " + dto.getDeviceName());

    String accessToken = jwtService.generateAccessToken(createdUser);
    String refreshToken = jwtService.generateRefreshToken(createdUser);
    refreshTokenService.create(refreshToken, createdUser.getId(), dto.getDeviceId(), dto.getDeviceName());

    return authMapper.toResponse(accessToken);
  }

  @Transactional
  public AuthResponseDTO login(LoginDTO dto) throws ResourceNotFoundException {
    UserEntity userEntity = userRepository.findByUsername(dto.getUsername())
        .orElseThrow(() -> new ResourceNotFoundException("No account found with the provided credentials."));

    if (!passwordEncoder.matches(dto.getPassword(), userEntity.getPassword())) {
      throw new IllegalArgumentException("Invalid username or password. Please check your credentials and try again.");
    }

    UserDTO user = userMapper.toDTO(userEntity);

    String accessToken = jwtService.generateAccessToken(user);
    String refreshToken = jwtService.generateRefreshToken(user);

    // If a session for this device already exists, replace it
    if (refreshTokenService.existsByUserIdAndDeviceId(user.getId(), dto.getDeviceId())) {
      refreshTokenService.deleteByUserIdAndDeviceId(user.getId(), dto.getDeviceId());
    }
    refreshTokenService.create(refreshToken, user.getId(), dto.getDeviceId(), dto.getDeviceName());

    return authMapper.toResponse(accessToken);
  }

  @Transactional
  public AuthResponseDTO refresh(UUID userId, String deviceId) throws ResourceNotFoundException, UnauthorizedException {
    RefreshTokenEntity refreshTokenEntity = refreshTokenRepository.findByUserIdAndDeviceId(userId, deviceId)
        .orElseThrow(() -> new ResourceNotFoundException("No active session found for this device. Please log in again."));

    String refreshToken = refreshTokenEntity.getToken();

    if (!jwtService.isTokenValid(refreshToken)) {
      refreshTokenService.deleteById(refreshTokenEntity.getId());
      throw new UnauthorizedException("Your session has expired. Please log in again to continue.");
    }

    UserDTO user = userMapper.toDTO(refreshTokenEntity.getUser());
    String newAccessToken = jwtService.generateAccessToken(user);

    return authMapper.toResponse(newAccessToken);
  }

  @Transactional
  public void logout(UUID userId, String deviceId) throws ResourceNotFoundException {
    refreshTokenService.deleteByUserIdAndDeviceId(userId, deviceId);
  }
}
