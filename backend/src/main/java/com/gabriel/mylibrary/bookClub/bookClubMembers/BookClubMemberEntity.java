package com.gabriel.mylibrary.bookClub.bookClubMembers;

import com.gabriel.mylibrary.bookClub.clubs.BookClubEntity;
import com.gabriel.mylibrary.common.BaseEntity;
import com.gabriel.mylibrary.user.UserEntity;

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
@Table(name = "book_club_members")
@Getter
@Setter
@NoArgsConstructor
public class BookClubMemberEntity extends BaseEntity {
  @Enumerated(EnumType.STRING)
  private BookClubMemberRole role;

  @ManyToOne
  @JoinColumn(name = "book_club_id")
  private BookClubEntity club;

  @ManyToOne
  @JoinColumn(name = "user_id")
  private UserEntity user;
}
