package com.gabriel.mylibrary.bookClub.clubInvite;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.gabriel.mylibrary.bookClub.clubInvite.enums.InviteStatus;
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
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "club_invites", uniqueConstraints = @UniqueConstraint(columnNames = {
    "inviter_id", "invitee_id", "club_id"
}))
@Getter
@Setter
@NoArgsConstructor
public class ClubInviteEntity extends BaseEntity {
  @Column(name = "token", nullable = false)
  private String token;

  @Column(name = "accepted_at", nullable = false)
  private LocalDateTime acceptedAt;

  @Column(name = "expires_at", nullable = false)
  private LocalDate expiresAt;

  @Column(name = "status", nullable = false)
  @Enumerated(EnumType.STRING)
  private InviteStatus status;

  @ManyToOne
  @JoinColumn(name = "book_club_id")
  private BookClubEntity bookClub;

  @ManyToOne
  @JoinColumn(name = "inviter_id")
  private UserEntity inviter;

  @ManyToOne
  @JoinColumn(name = "invitee_id")
  private UserEntity invitee;

  public UUID getInviteeId() {
    return this.getInvitee().getId();
  }
}
