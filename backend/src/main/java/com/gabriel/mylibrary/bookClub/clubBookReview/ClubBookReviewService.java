package com.gabriel.mylibrary.bookClub.clubBookReview;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gabriel.mylibrary.bookClub.bookClubMembers.BookClubMemberRepository;
import com.gabriel.mylibrary.bookClub.bookClubMembers.enums.BookClubMemberRole;
import com.gabriel.mylibrary.bookClub.clubBook.ClubBookEntity;
import com.gabriel.mylibrary.bookClub.clubBook.ClubBookRepository;
import com.gabriel.mylibrary.bookClub.clubBookReview.dtos.ClubBookReviewDTO;
import com.gabriel.mylibrary.bookClub.clubBookReview.dtos.CreateClubBookReviewDTO;
import com.gabriel.mylibrary.bookClub.clubBookReview.dtos.UpdateClubBookReviewDTO;
import com.gabriel.mylibrary.bookClub.clubBookReview.mappers.ClubBookReviewMapper;
import com.gabriel.mylibrary.common.errors.ForbiddenException;
import com.gabriel.mylibrary.common.errors.ResourceConflictException;
import com.gabriel.mylibrary.common.errors.ResourceNotFoundException;
import com.gabriel.mylibrary.common.errors.UnauthorizedException;
import com.gabriel.mylibrary.common.errors.UnprocessableContentException;
import com.gabriel.mylibrary.user.UserEntity;
import com.gabriel.mylibrary.user.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClubBookReviewService {

  private final ClubBookReviewRepository reviewRepository;
  private final ClubBookReviewMapper mapper;
  private final ClubBookRepository clubBookRepository;
  private final BookClubMemberRepository memberRepository;
  private final UserRepository userRepository;

  @Transactional
  public ClubBookReviewDTO create(UUID clubId, UUID clubBookId, CreateClubBookReviewDTO dto, UUID requesterId) {
    log.info("[ClubBookReviewService] createReview | clubId={} clubBookId={} userId={}", clubId, clubBookId, requesterId);
    requireMember(clubId, requesterId);
    ClubBookEntity clubBook = requireReviewableBook(clubId, clubBookId);

    if (reviewRepository.existsByClubBookIdAndUserId(clubBookId, requesterId)) {
      throw new ResourceConflictException("You have already reviewed this book.");
    }

    UserEntity user = userRepository.findById(requesterId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found."));

    ClubBookReviewEntity entity = new ClubBookReviewEntity();
    entity.setClubBook(clubBook);
    entity.setUser(user);
    entity.setRating(dto.getRating());
    entity.setReviewText(dto.getReviewText());

    ClubBookReviewDTO result = mapper.toDto(reviewRepository.save(entity));
    log.info("[ClubBookReviewService] createReview | complete clubId={} clubBookId={} reviewId={}", clubId, clubBookId, result.id());
    return result;
  }

  @Transactional(readOnly = true)
  public List<ClubBookReviewDTO> listByClubBook(UUID clubId, UUID clubBookId, UUID requesterId) {
    requireMember(clubId, requesterId);
    requireClubBookExists(clubId, clubBookId);
    return reviewRepository.findByClubBookId(clubBookId).stream()
        .map(mapper::toDto)
        .toList();
  }

  @Transactional
  public ClubBookReviewDTO update(UUID clubId, UUID clubBookId, UUID reviewId,
      UpdateClubBookReviewDTO dto, UUID requesterId) {
    requireMember(clubId, requesterId);
    requireClubBookExists(clubId, clubBookId);

    ClubBookReviewEntity review = reviewRepository.findById(reviewId)
        .orElseThrow(() -> new ResourceNotFoundException("Review not found."));

    requireOwner(review, requesterId);
    mapper.updateFromDto(dto, review);
    return mapper.toDto(reviewRepository.save(review));
  }

  @Transactional
  public void delete(UUID clubId, UUID clubBookId, UUID reviewId, UUID requesterId) {
    log.info("[ClubBookReviewService] deleteReview | clubId={} clubBookId={} reviewId={} userId={}", clubId, clubBookId, reviewId, requesterId);
    requireMember(clubId, requesterId);
    requireClubBookExists(clubId, clubBookId);

    ClubBookReviewEntity review = reviewRepository.findById(reviewId)
        .orElseThrow(() -> new ResourceNotFoundException("Review not found."));

    boolean isOwner = review.getUser() != null && review.getUser().getId().equals(requesterId);
    boolean isClubAdmin = memberRepository
        .existsByBookClubIdAndUserIdAndRole(clubId, requesterId, BookClubMemberRole.ADMIN);
    if (!isOwner && !isClubAdmin) {
      log.warn("[ClubBookReviewService] deleteReview | unauthorized userId={} reviewId={}", requesterId, reviewId);
      throw new UnauthorizedException("Only the review owner or a club admin can delete this review.");
    }

    reviewRepository.delete(review);
    log.info("[ClubBookReviewService] deleteReview | complete reviewId={}", reviewId);
  }

  // -------------------------------------------------------------------------
  // Guards
  // -------------------------------------------------------------------------

  /**
   * A book is reviewable when it has been started (startedAt != null) and is no
   * longer the active reading book (isCurrent = false). This covers both
   * "encerrado" (finishedAt != null) and books moved aside when a new one was
   * activated.
   */
  private ClubBookEntity requireReviewableBook(UUID clubId, UUID clubBookId) {
    ClubBookEntity book = clubBookRepository.findByIdAndClubId(clubBookId, clubId)
        .orElseThrow(() -> new ResourceNotFoundException("Club book not found."));

    if (Boolean.TRUE.equals(book.getIsCurrent())) {
      throw new UnprocessableContentException(
          "Reviews can only be submitted for books that are no longer actively being read.");
    }
    if (book.getStartedAt() == null) {
      throw new UnprocessableContentException(
          "Reviews can only be submitted for books that have been read by the club.");
    }
    return book;
  }

  private void requireMember(UUID clubId, UUID userId) {
    if (!memberRepository.existsByBookClubIdAndUserId(clubId, userId)) {
      throw new ForbiddenException("Only club members can manage reviews.");
    }
  }

  private void requireClubBookExists(UUID clubId, UUID clubBookId) {
    clubBookRepository.findByIdAndClubId(clubBookId, clubId)
        .orElseThrow(() -> new ResourceNotFoundException("Club book not found."));
  }

  private void requireOwner(ClubBookReviewEntity review, UUID requesterId) {
    if (review.getUser() == null || !review.getUser().getId().equals(requesterId)) {
      throw new ForbiddenException("You can only modify your own review.");
    }
  }
}
