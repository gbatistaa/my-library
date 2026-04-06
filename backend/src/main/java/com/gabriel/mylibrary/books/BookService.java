package com.gabriel.mylibrary.books;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gabriel.mylibrary.books.projections.BookSummary;
import com.gabriel.mylibrary.books.dtos.BookAuthorDTO;
import com.gabriel.mylibrary.books.dtos.BookDTO;
import com.gabriel.mylibrary.books.dtos.CreateBookDTO;
import com.gabriel.mylibrary.books.dtos.UpdateBookDTO;
import com.gabriel.mylibrary.books.mappers.BookMapper;
import com.gabriel.mylibrary.categories.CategoryEntity;
import com.gabriel.mylibrary.categories.CategoryRepository;
import com.gabriel.mylibrary.common.enums.BookStatus;
import com.gabriel.mylibrary.common.errors.ResourceConflictException;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;
import com.gabriel.mylibrary.achievement.AchievementEvaluator;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookService {

  private final BookMapper bookMapper;
  private final BookRepository bookRepository;
  private final EntityManager entityManager;
  private final CategoryRepository categoryRepository;
  private final AchievementEvaluator achievementEvaluator;

  @Transactional(readOnly = true)
  public Page<BookSummary> findAll(UUID userId, Pageable pageable) {
    return bookRepository.findSummariesByUserId(userId, pageable);
  }

  @Transactional(readOnly = true)
  public Page<BookSummary> findWithFilters(UUID userId, BookStatus status, Integer minRating,
      UUID categoryId, String author, Integer year, Pageable pageable) {
    // For complex filters with Specifications, we fetch entities and map to summary projection/dto
    // Mapping to an interface projection from an entity is not directly supported by MapStruct easily for Page.map
    // So we'll use a DTO or just map to the existing DTO and let the controller handle it?
    // Actually, to follow the projection rule, I'll create a BookSummaryDTO record.
    return bookRepository
        .findAll(BookSpecification.withFilters(userId, status, minRating, categoryId, author, year), pageable)
        .map(bookMapper::toSummaryDto);
  }

  @Transactional(readOnly = true)
  public BookDTO findOne(UUID id, UUID userId) throws ResourceNotFoundException {
    return bookRepository.findByIdAndUserId(id, userId)
        .map(bookMapper::toDto)
        .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
  }

  @Transactional(readOnly = true)
  public Page<BookSummary> findByTitle(String title, UUID userId, Pageable pageable) {
    if (title == null || title.isBlank()) {
      return findAll(userId, pageable);
    }
    return bookRepository.findSummariesByUserIdAndTitle(userId, title, pageable);
  }

  @Transactional
  public BookDTO create(CreateBookDTO dto, UUID userId) throws ResourceConflictException {
    BookEntity newBook = bookMapper.toEntity(dto);

    if (bookRepository.existsByIsbnAndUserId(newBook.getIsbn(), userId)) {
      throw new ResourceConflictException("Book with this ISBN already exists in your library: " + newBook.getIsbn());
    }

    if (newBook.getStatus() == BookStatus.COMPLETED && newBook.getRating() == null) {
      throw new ResourceConflictException("Rating is required when status is COMPLETED");
    }

    if (newBook.getStatus() != BookStatus.COMPLETED && newBook.getRating() != null) {
      throw new ResourceConflictException("Rating is not allowed when status is not COMPLETED");
    }

    if (newBook.getStartDate() != null && newBook.getFinishDate() != null
        && newBook.getFinishDate().isBefore(newBook.getStartDate())) {
      throw new ResourceConflictException("Finish date cannot be before start date");
    }

    if (newBook.getPagesRead() != null && newBook.getPagesRead() > newBook.getPages()) {
      throw new ResourceConflictException("Pages read cannot exceed total pages");
    }

    if (newBook.getStatus() == BookStatus.COMPLETED) {
      newBook.setPagesRead(newBook.getPages());
      if (newBook.getFinishDate() == null) {
        newBook.setFinishDate(java.time.LocalDate.now());
      }
    }

    if (dto.getCategoryIds() != null && !dto.getCategoryIds().isEmpty()) {
      Set<CategoryEntity> categories = dto.getCategoryIds().stream()
          .map(catId -> categoryRepository.findByIdAndUserId(catId, userId)
              .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + catId)))
          .collect(Collectors.toSet());
      newBook.setCategories(categories);
    }

    UserEntity userRef = entityManager.getReference(UserEntity.class, userId);
    newBook.setUser(userRef);

    BookDTO result = bookMapper.toDto(bookRepository.save(newBook));
    achievementEvaluator.evaluate(userId);
    return result;
  }

  @Transactional
  public BookDTO update(UUID id, UUID userId, UpdateBookDTO dto)
      throws ResourceNotFoundException, ResourceConflictException {
    BookEntity book = bookRepository.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

    if (dto.getIsbn() != null && !dto.getIsbn().equals(book.getIsbn())) {
      if (bookRepository.existsByIsbnAndUserId(dto.getIsbn(), userId)) {
        throw new ResourceConflictException("Book with this ISBN already exists in your library: " + dto.getIsbn());
      }
    }

    bookMapper.updateEntityFromDto(dto, book);

    if (dto.getCategoryIds() != null && !dto.getCategoryIds().isEmpty()) {
      Set<CategoryEntity> categories = dto.getCategoryIds().stream()
          .map(catId -> categoryRepository.findByIdAndUserId(catId, userId)
              .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + catId)))
          .collect(Collectors.toSet());
      book.setCategories(categories);
    }

    if (book.getPagesRead() != null && book.getPagesRead() > book.getPages()) {
      throw new ResourceConflictException("Pages read cannot exceed total pages");
    }

    if (book.getStatus() == BookStatus.COMPLETED && book.getRating() == null) {
      throw new ResourceConflictException("Rating is required when status is COMPLETED");
    }

    if (book.getStatus() != BookStatus.COMPLETED && book.getRating() != null) {
      throw new ResourceConflictException("Rating is not allowed when status is not COMPLETED");
    }

    if (book.getStartDate() != null && book.getFinishDate() != null
        && book.getFinishDate().isBefore(book.getStartDate())) {
      throw new ResourceConflictException("Finish date cannot be before start date");
    }

    if (book.getStatus() == BookStatus.COMPLETED) {
      book.setPagesRead(book.getPages());
      if (book.getFinishDate() == null) {
        book.setFinishDate(java.time.LocalDate.now());
      }
    }

    BookDTO result = bookMapper.toDto(bookRepository.save(book));
    achievementEvaluator.evaluate(userId);
    return result;
  }

  @Transactional
  public BookDTO resetForReread(UUID id, UUID userId) throws ResourceNotFoundException, ResourceConflictException {
    BookEntity book = bookRepository.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

    if (book.getStatus() != BookStatus.COMPLETED) {
      throw new ResourceConflictException("Only completed books can be reset for re-reading");
    }

    book.setStatus(BookStatus.READING);
    book.setPagesRead(0);
    book.setRating(null);
    book.setFinishDate(null);
    book.setStartDate(java.time.LocalDate.now());

    BookDTO result = bookMapper.toDto(bookRepository.save(book));
    achievementEvaluator.evaluate(userId);
    return result;
  }

  @Transactional(readOnly = true)
  public List<BookAuthorDTO> getAuthors(UUID userId) {
    return bookRepository.countBooksByAuthor(userId).stream()
        .map(row -> new BookAuthorDTO((String) row[0], (Long) row[1]))
        .toList();
  }

  @Transactional
  public void delete(UUID id, UUID userId) throws ResourceNotFoundException {
    BookEntity book = bookRepository.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
    bookRepository.delete(book);
  }
}
