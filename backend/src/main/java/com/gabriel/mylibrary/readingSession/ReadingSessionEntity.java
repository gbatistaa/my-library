package com.gabriel.mylibrary.readingSession;

import com.gabriel.mylibrary.books.userBook.UserBookEntity;
import com.gabriel.mylibrary.common.BaseEntity;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "reading_sessions")
@Getter
@Setter
@NoArgsConstructor
public class ReadingSessionEntity extends BaseEntity {

  @Column(name = "pages_read", nullable = false)
  private Integer pagesRead;

  @Column(name = "duration_seconds", nullable = false)
  private Long durationSeconds;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private UserEntity user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_book_id", nullable = false)
  private UserBookEntity userBook;

  @Column(name = "xp_gained", nullable = false, columnDefinition = "integer default 0")
  private Integer xpGained = 0;
}
