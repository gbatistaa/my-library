package com.gabriel.mylibrary.bookClub.clubBook;


import java.time.LocalDate;

import com.gabriel.mylibrary.bookClub.clubs.BookClubEntity;
import com.gabriel.mylibrary.books.BookEntity;
import com.gabriel.mylibrary.common.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "club_books")
@Getter
@Setter
@NoArgsConstructor
public class ClubBookEntity extends BaseEntity {
  @Column(name = "order_index", nullable = false)
  private Integer orderIndex;

  @Column(name = "is_current", nullable = false)
  private Boolean isCurrent;

  @Column(name="started_at")
  private LocalDate startedAt;

  @Column(name = "finished_at")
  private LocalDate finishedAt;

  @Column(name = "current_page")
  private Integer currentPage;

  @ManyToOne
  @JoinColumn(name = "club_id")
  private BookClubEntity club;

  @ManyToOne
  @JoinColumn(name = "book_id")
  private BookEntity book;
}
