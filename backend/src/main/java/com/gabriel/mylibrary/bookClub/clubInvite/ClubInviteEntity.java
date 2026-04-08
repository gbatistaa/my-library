package com.gabriel.mylibrary.bookClub.clubInvite;

import java.time.LocalDate;

import com.gabriel.mylibrary.bookClub.clubs.BookClubEntity;
import com.gabriel.mylibrary.common.BaseEntity;
import com.gabriel.mylibrary.user.UserEntity;

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
@Table(name = "club_invites")
@Getter
@Setter
@NoArgsConstructor
public class ClubInviteEntity extends BaseEntity {
  @Column(name = "token", nullable = false)
  private String token;

  @Column(name = "expires_at", nullable = false)
  private LocalDate expiresAt;

  @Column(name = "is_used", nullable = false)
  private Boolean isUsed;

  @Column(name = "status", nullable = false)
  @Enumerated(EnumType.STRING)
  private InviteStatus status;

  @ManyToOne
  @JoinColumn(name = "club_id")
  private BookClubEntity club;

  @ManyToOne
  @JoinColumn(name = "inviter_id")
  private UserEntity inviter;

  @ManyToOne
  @JoinColumn(name = "invitee_id")
  private UserEntity invitee;
}
