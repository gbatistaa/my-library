package com.gabriel.mylibrary.auth;

import org.springframework.stereotype.Service;

import com.gabriel.mylibrary.auth.dtos.AuthResponseDTO;
import com.gabriel.mylibrary.auth.dtos.LoginDTO;
import com.gabriel.mylibrary.auth.mappers.AuthMapper;
import com.gabriel.mylibrary.auth.tokens.services.JwtService;
import com.gabriel.mylibrary.auth.tokens.services.RefreshTokenService;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;
import com.gabriel.mylibrary.user.dtos.CreateUserDTO;
import com.gabriel.mylibrary.user.dtos.UserDTO;
import com.gabriel.mylibrary.user.mappers.UserMapper;
import com.gabriel.mylibrary.user.UserEntity;
import com.gabriel.mylibrary.user.UserRepository;
import com.gabriel.mylibrary.user.UserService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

  private final UserService userService;
  private final UserMapper userMapper;
  private final UserRepository userRepository;
  private final JwtService jwtService;
  private final RefreshTokenService refreshTokenService;
  private final AuthMapper authMapper;

  @Transactional
  public AuthResponseDTO register(CreateUserDTO dto) {
    UserDTO createdUser = userService.createUser(dto);

    String accessToken = jwtService.generateAccessToken(createdUser);
    String refreshToken = jwtService.generateRefreshToken(createdUser);
    refreshTokenService.create(refreshToken, createdUser.getId());

    return authMapper.toResponse(accessToken, refreshToken);
  }

  @Transactional
  public AuthResponseDTO login(LoginDTO dto) {
    UserEntity userEntity = userRepository.findByUsername(dto.getUsername())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    UserDTO user = userMapper.toDTO(userEntity);

    String accessToken = jwtService.generateAccessToken(user);
    String refreshToken = jwtService.generateRefreshToken(user);
    refreshTokenService.create(refreshToken, user.getId());

    return authMapper.toResponse(accessToken, refreshToken);
  }

  // TODO: Logout Method

  // TODO: Method for Refresh Token
}
