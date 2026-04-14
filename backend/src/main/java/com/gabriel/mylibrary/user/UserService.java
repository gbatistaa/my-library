package com.gabriel.mylibrary.user;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gabriel.mylibrary.common.errors.ResourceConflictException;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;
import com.gabriel.mylibrary.user.dtos.CreateUserDTO;
import com.gabriel.mylibrary.user.dtos.UpdateUserDTO;
import com.gabriel.mylibrary.user.dtos.UserDTO;
import com.gabriel.mylibrary.user.mappers.UserMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

  private final UserRepository userRepository;
  private final UserMapper userMapper;
  private final PasswordEncoder passwordEncoder;

  @Transactional(readOnly = true)
  public List<UserDTO> getAllUsers() {
    return userRepository.findAll().stream()
        .map(userMapper::toDTO)
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public UserDTO getUserById(UUID id) throws ResourceNotFoundException {
    UserEntity user = userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("No user found with the provided ID."));
    return userMapper.toDTO(user);
  }

  @Transactional
  public UserDTO createUser(CreateUserDTO createUserDTO) throws ResourceConflictException {
    if (userRepository.existsByUsername(createUserDTO.getUsername())) {
      throw new ResourceConflictException("The username '" + createUserDTO.getUsername() + "' is already taken. Please choose a different one.");
    }
    if (userRepository.existsByEmail(createUserDTO.getEmail())) {
      throw new ResourceConflictException("An account with the email '" + createUserDTO.getEmail() + "' already exists.");
    }

    UserEntity user = userMapper.toEntity(createUserDTO);

    String plainPassword = user.getPassword();
    String hashedPassword = passwordEncoder.encode(plainPassword);
    user.setPassword(hashedPassword);

    UserEntity savedUser = userRepository.save(user);

    return userMapper.toDTO(savedUser);
  }

  @Transactional
  public UserDTO updateUser(UUID id, UpdateUserDTO updateUserDTO) throws ResourceNotFoundException {
    UserEntity user = userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("No user found with the provided ID."));

    if (updateUserDTO.getUsername() != null && !updateUserDTO.getUsername().equals(user.getUsername())) {
      if (userRepository.existsByUsername(updateUserDTO.getUsername())) {
        throw new ResourceConflictException("The username '" + updateUserDTO.getUsername() + "' is already taken. Please choose a different one.");
      }
    }

    if (updateUserDTO.getEmail() != null && !updateUserDTO.getEmail().equals(user.getEmail())) {
      if (userRepository.existsByEmail(updateUserDTO.getEmail())) {
        throw new ResourceConflictException("An account with the email '" + updateUserDTO.getEmail() + "' already exists.");
      }
    }

    if (updateUserDTO.getPassword() != null) {
      String hashedPassword = passwordEncoder.encode(updateUserDTO.getPassword());
      user.setPassword(hashedPassword);
    }

    userMapper.updateEntityFromDto(updateUserDTO, user);
    UserEntity updatedUser = userRepository.save(user);
    return userMapper.toDTO(updatedUser);
  }

  @Transactional
  public void deleteUser(UUID id) throws ResourceNotFoundException {
    if (!userRepository.existsById(id)) {
      throw new ResourceNotFoundException("No user found with the provided ID.");
    }
    userRepository.deleteById(id);
  }
}
