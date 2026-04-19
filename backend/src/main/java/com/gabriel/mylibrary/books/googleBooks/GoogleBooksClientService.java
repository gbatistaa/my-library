package com.gabriel.mylibrary.books.googleBooks;

import java.util.List;
import java.util.Optional;

import com.gabriel.mylibrary.books.googleBooks.dto.GoogleBookVolumeDTO;

public interface GoogleBooksClientService {

  /**
   * Fetches a volume by its Google Books id.
   *
   * <p>
   * Returns {@link Optional#empty()} if Google responds with 404. Throws
   * {@code GoogleBooksException} on 5xx / IO failure, and
   * {@code UnprocessableContentException} if the returned volume is missing data
   * required by the catalog (title, author, pageCount).
   */
  Optional<GoogleBookVolumeDTO> fetchByVolumeId(String googleBooksId);

  /**
   * Searches Google Books by title query. Returns up to {@code maxResults} volumes.
   * Volumes missing title, author, or page count are silently skipped.
   * Returns an empty list on network errors instead of throwing.
   */
  List<GoogleBookVolumeDTO> searchByTitle(String query, int maxResults);
}
