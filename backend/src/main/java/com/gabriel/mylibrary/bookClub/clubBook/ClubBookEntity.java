package com.gabriel.mylibrary.bookClub.clubBook;

import java.time.LocalDate;

import com.gabriel.mylibrary.bookClub.clubs.BookClubEntity;
import com.gabriel.mylibrary.books.BookEntity;
import com.gabriel.mylibrary.common.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "club_books", uniqueConstraints = {
    @UniqueConstraint(name = "uk_club_books_club_book", columnNames = { "club_id", "book_id" })
})
@Getter
@Setter
@NoArgsConstructor
public class ClubBookEntity extends BaseEntity {
  @Column(name = "order_index", nullable = false)
  private Integer orderIndex;

  @Column(name = "is_current", nullable = false)
  private Boolean isCurrent;

  @Column(name = "started_at")
  private LocalDate startedAt;

  @Column(name = "finished_at")
  private LocalDate finishedAt;

  @Column(name = "deadline")
  private LocalDate deadline;

  @Column(name = "deadline_extended_at")
  private LocalDate deadlineExtendedAt;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "club_id", nullable = false, updatable = false, foreignKey = @ForeignKey(name = "fk_club_books_club"))
  private BookClubEntity club;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "book_id", nullable = false, updatable = false, foreignKey = @ForeignKey(name = "fk_club_books_book"))
  private BookEntity book;
}
