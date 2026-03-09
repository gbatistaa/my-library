package com.gabriel.mylibrary.common.errors;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.dao.DataIntegrityViolationException;
import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleNotFound(
      ResourceNotFoundException ex,
      HttpServletRequest request) {

    ErrorResponse response = ErrorResponse.builder()
        .status(HttpStatus.NOT_FOUND.value())
        .error("Not Found")
        .message(ex.getMessage())
        .path(request.getRequestURI())
        .timestamp(LocalDateTime.now())
        .build();

    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
  }

  @ExceptionHandler(ResourceConflictException.class)
  public ResponseEntity<ErrorResponse> handleConflict(
      ResourceConflictException ex,
      HttpServletRequest request) {

    ErrorResponse response = ErrorResponse.builder()
        .status(HttpStatus.CONFLICT.value())
        .error("Conflict")
        .message(ex.getMessage())
        .path(request.getRequestURI())
        .timestamp(LocalDateTime.now())
        .build();

    return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<ErrorResponse> handleDataIntegrity(
      DataIntegrityViolationException ex,
      HttpServletRequest request) {

    String message = "Database integrity violation";
    if (ex.getRootCause() != null && ex.getRootCause().getMessage().contains("duplicate key")) {
      message = "Resource already exists (duplicate key violation)";
    }

    ErrorResponse response = ErrorResponse.builder()
        .status(HttpStatus.CONFLICT.value())
        .error("Conflict")
        .message(message)
        .path(request.getRequestURI())
        .timestamp(LocalDateTime.now())
        .build();

    return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
  }

  @ExceptionHandler(UnauthorizedException.class)
  public ResponseEntity<ErrorResponse> handleUnauthorized(
      UnauthorizedException ex,
      HttpServletRequest request) {

    ErrorResponse response = ErrorResponse.builder()
        .status(HttpStatus.UNAUTHORIZED.value())
        .error("Unauthorized")
        .message(ex.getMessage())
        .path(request.getRequestURI())
        .timestamp(LocalDateTime.now())
        .build();

    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
  }

  @ExceptionHandler(ForbiddenException.class)
  public ResponseEntity<ErrorResponse> handleForbidden(
      ForbiddenException ex,
      HttpServletRequest request) {

    ErrorResponse response = ErrorResponse.builder()
        .status(HttpStatus.FORBIDDEN.value())
        .error("Forbidden")
        .message(ex.getMessage())
        .path(request.getRequestURI())
        .timestamp(LocalDateTime.now())
        .build();

    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ErrorResponse> handleAccessDenied(
      AccessDeniedException ex,
      HttpServletRequest request) {

    ErrorResponse response = ErrorResponse.builder()
        .status(HttpStatus.FORBIDDEN.value())
        .error("Forbidden")
        .message("You do not have permission to access this resource")
        .path(request.getRequestURI())
        .timestamp(LocalDateTime.now())
        .build();

    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidation(
      MethodArgumentNotValidException ex,
      HttpServletRequest request) {

    Map<String, String> fieldErrors = ex.getBindingResult()
        .getFieldErrors()
        .stream()
        .collect(Collectors.toMap(
            fieldError -> fieldError.getField(),
            fieldError -> fieldError.getDefaultMessage(),
            (existing, duplicate) -> existing));

    ErrorResponse response = ErrorResponse.builder()
        .status(HttpStatus.BAD_REQUEST.value())
        .error("Validation Error")
        .message("Validation error in fields")
        .path(request.getRequestURI())
        .timestamp(LocalDateTime.now())
        .fieldErrors(fieldErrors)
        .build();

    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleGeneric(
      Exception ex,
      HttpServletRequest request) {

    ErrorResponse response = ErrorResponse.builder()
        .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
        .error("Internal Server Error")
        .message(ex.getMessage())
        .path(request.getRequestURI())
        .timestamp(LocalDateTime.now())
        .build();

    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<ErrorResponse> handleJsonParse(
      HttpMessageNotReadableException ex,
      HttpServletRequest request) {

    String message = ex.getMostSpecificCause().getMessage();

    ErrorResponse response = ErrorResponse.builder()
        .status(HttpStatus.BAD_REQUEST.value())
        .error("Invalid Request Body")
        .message(message)
        .path(request.getRequestURI())
        .timestamp(LocalDateTime.now())
        .build();

    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
  }
}
