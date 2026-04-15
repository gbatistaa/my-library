package com.gabriel.mylibrary.books.googleBooks.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GoogleVolumeResponse(String id, VolumeInfo volumeInfo) {

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record VolumeInfo(
      String title,
      List<String> authors,
      String publisher,
      String publishedDate,
      String description,
      Integer pageCount,
      List<String> categories,
      String language,
      List<IndustryIdentifier> industryIdentifiers,
      ImageLinks imageLinks) {
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record IndustryIdentifier(String type, String identifier) {
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record ImageLinks(String thumbnail, String smallThumbnail) {
  }
}
