package com.gabriel.mylibrary.books.googleBooks.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GoogleVolumesListResponse(List<GoogleVolumeResponse> items) {
}
