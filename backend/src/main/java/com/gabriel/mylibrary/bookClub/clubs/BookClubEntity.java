package com.gabriel.mylibrary.bookClub.clubs;

import java.util.List;

import com.gabriel.mylibrary.bookClub.bookClubMembers.BookClubMemberEntity;
import com.gabriel.mylibrary.bookClub.clubBook.ClubBookEntity;
import com.gabriel.mylibrary.bookClub.clubs.enums.BookClubStatus;
import com.gabriel.mylibrary.common.BaseEntity;
import com.gabriel.mylibrary.user.UserEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "book_club")
@Getter
@Setter
@NoArgsConstructor
public class BookClubEntity extends BaseEntity {
  @Column(nullable = false, length = 100)
  private String name;

  @Column(nullable = true)
  private String description;

  @Column(nullable = true, name = "max_members")
  @Min(3)
  private Integer maxMembers;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private BookClubStatus status;

  @ManyToOne
  @JoinColumn(name = "admin_id", nullable = false)
  private UserEntity admin;

  @OneToMany(mappedBy = "bookClub", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private List<BookClubMemberEntity> members;

  @OneToMany(mappedBy = "club", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private List<ClubBookEntity> books;
}
