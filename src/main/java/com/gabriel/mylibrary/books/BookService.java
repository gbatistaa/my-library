package com.gabriel.mylibrary.books;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gabriel.mylibrary.books.dtos.BookDTO;
import com.gabriel.mylibrary.books.dtos.CreateBookDTO;
import com.gabriel.mylibrary.books.dtos.UpdateBookDTO;
import com.gabriel.mylibrary.books.mappers.BookMapper;
import com.gabriel.mylibrary.categories.CategoryEntity;
import com.gabriel.mylibrary.categories.CategoryRepository;
import com.gabriel.mylibrary.categories.dtos.CategoryDTO;
import com.gabriel.mylibrary.categories.mappers.CategoryMapper;
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
  private final CategoryMapper categoryMapper;
  private final AchievementEvaluator achievementEvaluator;

  @Transactional(readOnly = true)
  public Page<BookDTO> findAll(UUID userId, Pageable pageable) {
    return bookRepository.findAllByUserId(userId, pageable)
        .map(bookMapper::toDto);
  }

  @Transactional(readOnly = true)
  public Page<BookDTO> findWithFilters(UUID userId, BookStatus status, Integer minRating,
      String genre, String author, Integer year, Pageable pageable) {
    return bookRepository
        .findAll(BookSpecification.withFilters(userId, status, minRating, genre, author, year), pageable)
        .map(bookMapper::toDto);
  }

  @Transactional(readOnly = true)
  public BookDTO findOne(UUID id, UUID userId) throws ResourceNotFoundException {
    return bookRepository.findByIdAndUserId(id, userId)
        .map(bookMapper::toDto)
        .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
  }

  @Transactional(readOnly = true)
  public Page<BookDTO> findByTitle(String title, UUID userId, Pageable pageable) {
    if (title == null || title.isBlank()) {
      return findAll(userId, pageable);
    }
    return bookRepository.findAllByUserIdAndTitleContainingIgnoreCase(userId, title, pageable)
        .map(bookMapper::toDto);
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

    BookDTO result = bookMapper.toDto(bookRepository.save(book));
    achievementEvaluator.evaluate(userId);
    return result;
  }

  @Transactional
  public void delete(UUID id, UUID userId) throws ResourceNotFoundException {
    BookEntity book = bookRepository.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
    bookRepository.delete(book);
  }

  @Transactional(readOnly = true)
  public List<CategoryDTO> getCategories(UUID bookId, UUID userId) throws ResourceNotFoundException {
    BookEntity book = bookRepository.findByIdAndUserId(bookId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));

    return book.getCategories().stream()
        .map(categoryMapper::toDto)
        .toList();
  }

  @Transactional
  public BookDTO addCategory(UUID bookId, UUID categoryId, UUID userId) throws ResourceNotFoundException {
    BookEntity book = bookRepository.findByIdAndUserId(bookId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));

    CategoryEntity category = categoryRepository.findByIdAndUserId(categoryId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

    boolean alreadyLinked = book.getCategories().stream()
        .anyMatch(c -> c.getId().equals(categoryId));

    if (alreadyLinked) {
      throw new ResourceConflictException("Category already linked to this book: " + category.getName());
    }

    book.getCategories().add(category);
    return bookMapper.toDto(bookRepository.save(book));
  }

  @Transactional
  public BookDTO removeCategory(UUID bookId, UUID categoryId, UUID userId) throws ResourceNotFoundException {
    BookEntity book = bookRepository.findByIdAndUserId(bookId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));

    CategoryEntity category = categoryRepository.findByIdAndUserId(categoryId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

    boolean wasLinked = book.getCategories().removeIf(c -> c.getId().equals(category.getId()));

    if (!wasLinked) {
      throw new ResourceNotFoundException("Category is not linked to this book: " + category.getName());
    }

    return bookMapper.toDto(bookRepository.save(book));
  }
}
