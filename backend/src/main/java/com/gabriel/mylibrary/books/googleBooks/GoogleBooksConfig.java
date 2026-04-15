package com.gabriel.mylibrary.books.googleBooks;

import java.time.Duration;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(GoogleBooksProperties.class)
public class GoogleBooksConfig {

  @Bean
  RestClient googleBooksRestClient(GoogleBooksProperties props) {
    SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
    requestFactory.setConnectTimeout(Duration.ofMillis(props.timeoutMs()));
    requestFactory.setReadTimeout(Duration.ofMillis(props.timeoutMs()));

    return RestClient.builder()
        .baseUrl(props.baseUrl())
        .requestFactory(requestFactory)
        .build();
  }
}
