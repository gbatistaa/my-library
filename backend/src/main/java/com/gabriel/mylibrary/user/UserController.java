package com.gabriel.mylibrary.user;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gabriel.mylibrary.user.dtos.CreateUserDTO;
import com.gabriel.mylibrary.user.dtos.UpdateUserDTO;
import com.gabriel.mylibrary.user.dtos.UserDTO;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

  private final UserService userService;

  @GetMapping
  public ResponseEntity<List<UserDTO>> getAllUsers() {
    return ResponseEntity.ok(userService.getAllUsers());
  }

  @GetMapping("/{id}")
  public ResponseEntity<UserDTO> getUserById(@PathVariable UUID id) {
    return ResponseEntity.ok(userService.getUserById(id));
  }

  @PostMapping
  public ResponseEntity<UserDTO> createUser(@Valid @RequestBody CreateUserDTO user) {
    return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(user));
  }

  @PatchMapping("/{id}")
  public ResponseEntity<UserDTO> updateUser(@PathVariable UUID id, @Valid @RequestBody UpdateUserDTO user) {
    return ResponseEntity.ok(userService.updateUser(id, user));
  }

  @PatchMapping("/me")
  public ResponseEntity<UserDTO> updateMe(@AuthenticationPrincipal UserEntity user,
      @Valid @RequestBody UpdateUserDTO updateDto) {
    return ResponseEntity.ok(userService.updateUser(user.getId(), updateDto));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
    userService.deleteUser(id);
    return ResponseEntity.noContent().build();
  }

  @DeleteMapping("/me")
  public ResponseEntity<Void> deleteMe(@AuthenticationPrincipal UserEntity user) {
    userService.deleteUser(user.getId());
    return ResponseEntity.noContent().build();
  }

}
