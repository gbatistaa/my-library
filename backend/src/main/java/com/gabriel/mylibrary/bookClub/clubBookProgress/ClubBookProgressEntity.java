package com.gabriel.mylibrary.bookClub.clubBookProgress;

import java.time.LocalDate;

import com.gabriel.mylibrary.bookClub.bookClubMembers.BookClubMemberEntity;
import com.gabriel.mylibrary.bookClub.clubBook.ClubBookEntity;
import com.gabriel.mylibrary.bookClub.clubBookProgress.enums.MemberProgressStatus;
import com.gabriel.mylibrary.common.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "club_book_progress")
@Getter
@Setter
@NoArgsConstructor
public class ClubBookProgressEntity extends BaseEntity {
  @Column(name = "current_page", nullable = false)
  private Integer currentPage = 1;

  @Enumerated(EnumType.STRING)
  @Column(name = "member_progress_status", nullable = false)
  private MemberProgressStatus status = MemberProgressStatus.READING;

  @Column(name = "finished_at")
  private LocalDate finishedAt;

  @Column(name = "started_at")
  private LocalDate startedAt;

  @ManyToOne
  @JoinColumn(name = "member_id", nullable = false)
  private BookClubMemberEntity member;

  @ManyToOne
  @JoinColumn(name = "club_book_id", nullable = false)
  private ClubBookEntity clubBook;
}
