package com.gabriel.mylibrary.books;

import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gabriel.mylibrary.books.dtos.BookDTO;
import com.gabriel.mylibrary.books.googleBooks.GoogleBooksClientService;
import com.gabriel.mylibrary.books.googleBooks.dto.GoogleBookVolumeDTO;
import com.gabriel.mylibrary.books.mappers.BookMapper;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookService {

  private final BookRepository bookRepository;
  private final BookMapper bookMapper;
  private final GoogleBooksClientService googleBooksClientService;

  @Transactional(readOnly = true)
  public BookDTO findById(UUID id) {
    return bookRepository.findById(id)
        .map(bookMapper::toDto)
        .orElseThrow(() -> new ResourceNotFoundException("No book found with the provided ID."));
  }

  @Transactional(readOnly = true)
  public BookDTO findByGoogleBooksId(String googleBooksId) {
    return bookRepository.findByGoogleBooksId(googleBooksId)
        .map(bookMapper::toDto)
        .orElseThrow(() -> new ResourceNotFoundException(
            "No book found with Google Books id '" + googleBooksId + "'."));
  }

  @Transactional(readOnly = true)
  public Page<BookDTO> searchCatalog(String title, Pageable pageable) {
    String query = title == null ? "" : title;
    return bookRepository.findByTitleContainingIgnoreCase(query, pageable)
        .map(bookMapper::toDto);
  }

  /**
   * Returns the catalog entry for a Google Books id, fetching from Google and
   * persisting it on first access. Safe under concurrent first-time inserts —
   * the losing thread re-reads the winner's row.
   */
  @Transactional
  public BookEntity findOrFetchByGoogleBooksId(String googleBooksId) {
    return bookRepository.findByGoogleBooksId(googleBooksId)
        .orElseGet(() -> fetchAndPersist(googleBooksId));
  }

  @Transactional
  public BookDTO findOrFetchDtoByGoogleBooksId(String googleBooksId) {
    return bookMapper.toDto(findOrFetchByGoogleBooksId(googleBooksId));
  }

  private BookEntity fetchAndPersist(String googleBooksId) {
    GoogleBookVolumeDTO volume = googleBooksClientService.fetchByVolumeId(googleBooksId)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Google Books has no volume with id '" + googleBooksId + "'."));

    BookEntity entity = bookMapper.toEntity(volume);
    try {
      return bookRepository.saveAndFlush(entity);
    } catch (DataIntegrityViolationException race) {
      return bookRepository.findByGoogleBooksId(googleBooksId)
          .orElseThrow(() -> race);
    }
  }
}
