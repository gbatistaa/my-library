package com.gabriel.mylibrary.bookClub.bookClubMembers;

import com.gabriel.mylibrary.bookClub.bookClubMembers.enums.BookClubMemberRole;
import com.gabriel.mylibrary.bookClub.bookClubMembers.enums.BookClubMemberStatus;
import com.gabriel.mylibrary.bookClub.clubs.BookClubEntity;
import com.gabriel.mylibrary.common.BaseEntity;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "book_club_members", uniqueConstraints = {
    @UniqueConstraint(columnNames = { "book_club_id", "user_id" }) })
@Getter
@Setter
@NoArgsConstructor
public class BookClubMemberEntity extends BaseEntity {
  @Enumerated(EnumType.STRING)
  private BookClubMemberRole role;

  @Enumerated(EnumType.STRING)
  private BookClubMemberStatus status;

  @ManyToOne
  @JoinColumn(name = "book_club_id", nullable = false)
  private BookClubEntity bookClub;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false, updatable = false)
  private UserEntity user;
}
