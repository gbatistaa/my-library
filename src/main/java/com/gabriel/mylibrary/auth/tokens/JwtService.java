package com.gabriel.mylibrary.auth.tokens;

import java.security.Key;
import java.util.Date;

import org.springframework.stereotype.Service;

import com.gabriel.mylibrary.auth.config.JwtProperties;
import com.gabriel.mylibrary.user.dtos.UserDTO;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JwtService {

  private final JwtProperties jwtProperties;

  public String generateAccessToken(UserDTO user) {
    Key key = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes());

    return Jwts.builder()
        .setSubject(user.getUsername())
        .setIssuedAt(new Date(System.currentTimeMillis()))
        .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24))
        .signWith(key)
        .compact();
  }

  public String generateRefreshToken(UserDTO user) {
    Key key = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes());

    return Jwts.builder()
        .setSubject(user.getUsername())
        .setIssuedAt(new Date(System.currentTimeMillis()))
        .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24 * 7))
        .signWith(key)
        .compact();
  }
}
