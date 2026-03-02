package com.gabriel.mylibrary.user;

import com.gabriel.mylibrary.common.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.Max;

@Entity
public class User extends BaseEntity {
  @Max(30)
  @Column(name = "username", nullable = false)
  private String username;

  @Max(100)
  @Column(name = "email", nullable = false)
  private String email;
}
