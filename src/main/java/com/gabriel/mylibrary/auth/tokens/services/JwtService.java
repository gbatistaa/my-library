package com.gabriel.mylibrary.auth.tokens;

import java.security.Key;
import java.util.Base64;
import java.util.Date;

import org.springframework.stereotype.Service;

import com.gabriel.mylibrary.auth.config.JwtProperties;
import com.gabriel.mylibrary.user.dtos.UserDTO;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JwtService {

  private final JwtProperties jwtProperties;
  private Key signingKey;

  @PostConstruct
  public void init() {
    byte[] keyBytes = Base64.getDecoder().decode(jwtProperties.getSecret());
    this.signingKey = Keys.hmacShaKeyFor(keyBytes);
  }

  public String generateAccessToken(UserDTO user) {
    return Jwts.builder()
        .setSubject(user.getUsername())
        .setIssuedAt(new Date(System.currentTimeMillis()))
        .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24))
        .signWith(signingKey)
        .compact();
  }

  public String generateRefreshToken(UserDTO user) {

    return Jwts.builder()
        .setSubject(user.getUsername())
        .setIssuedAt(new Date(System.currentTimeMillis()))
        .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24 * 7))
        .signWith(signingKey)
        .compact();
  }
}
