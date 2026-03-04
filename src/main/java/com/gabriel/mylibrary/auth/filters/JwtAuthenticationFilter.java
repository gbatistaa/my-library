package com.gabriel.mylibrary.auth.filters;

import java.io.IOException;
import java.util.Collection;
import java.util.Collections;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.gabriel.mylibrary.auth.tokens.services.JwtService;
import com.gabriel.mylibrary.user.UserEntity;
import com.gabriel.mylibrary.user.UserRepository;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * JWT Authentication Filter — runs once per request.
 *
 * Flow:
 * 1. Read the "access_token" from HttpOnly cookies.
 * 2. Validate the token via JwtService.
 * 3. Load the user from the DB using the username embedded in the token.
 * 4. Set the authenticated user in the SecurityContextHolder.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private static final String COOKIE_NAME = "access_token";

  private final JwtService jwtService;
  private final UserRepository userRepository;

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {

    String token = null;
    if (request.getCookies() != null) {
      for (Cookie cookie : request.getCookies()) {
        if (COOKIE_NAME.equals(cookie.getName())) {
          token = cookie.getValue();
          break;
        }
      }
    }

    if (token == null) {
      filterChain.doFilter(request, response);
      return;
    }

    if (!jwtService.isTokenValid(token)) {
      filterChain.doFilter(request, response);
      return;
    }

    if (SecurityContextHolder.getContext().getAuthentication() != null) {
      filterChain.doFilter(request, response);
      return;
    }

    Claims claims = jwtService.extractClaims(token);
    String username = jwtService.extractUsername(claims);
    if (username == null) {
      filterChain.doFilter(request, response);
      return;
    }

    UserEntity userEntity = userRepository.findByUsername(username).orElse(null);
    if (userEntity == null) {
      filterChain.doFilter(request, response);
      return;
    }

    // TODO: add roles when implemented
    Collection<GrantedAuthority> authorities = Collections.emptyList();

    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userEntity, null,
        authorities);

    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

    SecurityContextHolder.getContext().setAuthentication(authentication);

    filterChain.doFilter(request, response);
  }
}
