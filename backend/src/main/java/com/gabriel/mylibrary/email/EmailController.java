package com.gabriel.mylibrary.email;

import com.gabriel.mylibrary.email.dtos.EmailRequestDTO;
import com.gabriel.mylibrary.user.UserEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/email")
@RequiredArgsConstructor
@Slf4j
public class EmailController {

  private final EmailService emailService;

  @PostMapping("/send")
  public ResponseEntity<Void> sendEmail(
      @Valid @RequestBody EmailRequestDTO request,
      @AuthenticationPrincipal UserEntity user) {
    log.info("Received request from '{}' to send email to '{}'", user.getUsername(), request.getTo());
    emailService.sendHtmlEmail(request.getTo(), request.getSubject(), user.getName());
    return ResponseEntity.ok().build();
  }
}
