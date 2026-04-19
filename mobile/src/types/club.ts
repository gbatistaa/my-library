export type BookClubStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type BookClubMemberRole = "ADMIN" | "MEMBER";
export type BookClubMemberStatus = "ACTIVE" | "INACTIVE" | "BANNED";
export type InviteStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";
export type MemberProgressStatus = "READING" | "FINISHED" | "UNFINISHED";

export interface BookClubDTO {
  id: string;
  name: string;
  description: string;
  maxMembers: number;
  status: BookClubStatus;
  activeMembersCount: number;
  totalBooksCount: number;
}

export interface ClubDashboardDTO {
  clubId: string;
  clubName: string;
  description: string;
  status: BookClubStatus;
  totalBooks: number;
  finishedBooks: number;
  activeMembers: number;
  maxMembers: number;
  currentBook: {
    clubBookId: string;
    bookTitle: string;
    bookAuthor: string;
    totalPages: number;
    startedAt: string;
    deadline: string;
    totalActiveMembers: number;
    finishedCount: number;
    pendingCount: number;
    averageProgressPercent: number;
  } | null;
}

export interface ClubBookDTO {
  id: string;
  clubId: string;
  book: {
    id: string;
    title: string;
    author: string;
    pages: number;
    coverUrl?: string;
  };
  orderIndex: number;
  isCurrent: boolean;
  startedAt: string | null;
  finishedAt: string | null;
  deadline: string;
  deadlineExtendedAt: string | null;
  // Mobile specific helpers
  groupProgress?: number; // Representa o 68% do grupo
  averageRating?: number; // Para livros concluídos
}

export interface ClubBookProgressDTO {
  id: string;
  memberId: string;
  clubBookId: string;
  currentPage: number;
  progressPercent: number;
  status: MemberProgressStatus;
  startedAt: string | null;
  finishedAt: string | null;
  // Included via joins/mapper for UI
  user: {
    id: string;
    name: string;
    username: string;
    profilePicPath?: string;
  };
}

export interface ClubInviteDTO {
  id: string;
  clubName: string;
  inviterName: string;
  expiresAt: string;
  status: InviteStatus;
}

export interface BookClubMemberDTO {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    profilePicPath?: string;
  };
  role: BookClubMemberRole;
  status: BookClubMemberStatus;
  joinedAt: string;
}

export interface ClubBookReviewDTO {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    profilePicPath?: string;
  };
  rating: number;
  text: string;
  createdAt: string;
}
