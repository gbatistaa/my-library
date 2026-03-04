package com.gabriel.mylibrary.auth.tokens.services;

import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.gabriel.mylibrary.auth.config.JwtProperties;
import com.gabriel.mylibrary.user.dtos.UserDTO;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
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
        .claim("userId", user.getId().toString())
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24)) // 24h
        .signWith(signingKey)
        .compact();
  }

  public String generateRefreshToken(UserDTO user) {
    return Jwts.builder()
        .setSubject(user.getUsername())
        .claim("userId", user.getId().toString())
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24 * 30)) // 30d
        .signWith(signingKey)
        .compact();
  }

  public String extractUsername(Claims claims) {
    return claims.getSubject();
  }

  public UUID extractUserId(Claims claims) {
    String userId = claims.get("userId", String.class);
    return UUID.fromString(userId);
  }

  public boolean isTokenValid(String token) {
    try {
      Claims claims = parseClaims(token);
      return !claims.getExpiration().before(new Date());
    } catch (JwtException | IllegalArgumentException e) {
      return false;
    }
  }

  private Claims parseClaims(String token) {
    return Jwts.parserBuilder()
        .setSigningKey(signingKey)
        .build()
        .parseClaimsJws(token)
        .getBody();
  }

  public Claims extractClaims(String token) {
    try {
      return parseClaims(token);
    } catch (JwtException | IllegalArgumentException e) {
      return null;
    }
  }
}
