package com.gabriel.mylibrary.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

@Data
@Configuration
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {
  /**
   * Secret key for JWT signing. Should be at least 256 bits (32 characters).
   */
  private String secret;
}
