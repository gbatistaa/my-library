package com.gabriel.mylibrary.bookClub.clubBookReview;

import com.gabriel.mylibrary.bookClub.clubBook.ClubBookEntity;
import com.gabriel.mylibrary.common.BaseEntity;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "club_book_reviews")
@Getter
@Setter
@NoArgsConstructor
public class ClubBookReviewEntity extends BaseEntity {
  @Column(name = "rating", nullable = false)
  private Integer rating;

  @Column(name = "review_text", nullable = false)
  private String reviewText;

  @ManyToOne
  @JoinColumn(name = "club_book_id", nullable = false)
  private ClubBookEntity clubBook;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false, updatable = false)
  private UserEntity user;
}
