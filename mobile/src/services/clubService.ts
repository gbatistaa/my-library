import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { 
  BookClubDTO, 
  ClubDashboardDTO, 
  ClubBookDTO, 
  ClubBookProgressDTO, 
  ClubInviteDTO, 
  BookClubMemberDTO,
  ClubBookReviewDTO
} from "../types/club";

// ─── Queries ───────────────────────────────────────────────────────────────

export function useMyBookClubs() {
  return useQuery({
    queryKey: ["myBookClubs"],
    queryFn: async () => {
      const { data } = await api.get<{ content: BookClubDTO[] }>("/book-clubs/me");
      return data.content;
    },
  });
}

export function useClubDashboard(clubId: string) {
  return useQuery({
    queryKey: ["clubDashboard", clubId],
    queryFn: async () => {
      const { data } = await api.get<ClubDashboardDTO>(`/book-clubs/${clubId}/dashboard`);
      return data;
    },
    enabled: !!clubId,
  });
}

export function useClubMembers(clubId: string) {
  return useQuery({
    queryKey: ["clubMembers", clubId],
    queryFn: async () => {
      const { data } = await api.get<{ content: BookClubMemberDTO[] }>(`/members/club/${clubId}`);
      return data.content;
    },
    enabled: !!clubId,
  });
}

export function useClubBooksQueue(clubId: string) {
  return useQuery({
    queryKey: ["clubBooksQueue", clubId],
    queryFn: async () => {
      const { data } = await api.get<{ content: ClubBookDTO[] }>(`/book-clubs/${clubId}/books`);
      return data.content;
    },
    enabled: !!clubId,
  });
}

export function useClubProgress(clubBookId: string) {
  return useQuery({
    queryKey: ["clubProgress", clubBookId],
    queryFn: async () => {
      const { data } = await api.get<{ content: ClubBookProgressDTO[] }>(`/progress?clubBookId=${clubBookId}`);
      return data.content;
    },
    enabled: !!clubBookId,
  });
}

export function useClubReviews(clubId: string, clubBookId: string) {
  return useQuery({
    queryKey: ["clubReviews", clubBookId],
    queryFn: async () => {
      const { data } = await api.get<ClubBookReviewDTO[]>(`/book-clubs/${clubId}/books/${clubBookId}/reviews`);
      return data;
    },
    enabled: !!clubId && !!clubBookId,
  });
}

export function useMyPendingInvites() {
  return useQuery({
    queryKey: ["myPendingInvites"],
    queryFn: async () => {
      const { data } = await api.get<ClubInviteDTO[]>("/club-invites/me/pending");
      return data;
    },
  });
}

// ─── Mutations ─────────────────────────────────────────────────────────────

export function useCreateClubMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; description: string; maxMembers: number }) => {
      const { data } = await api.post<BookClubDTO>("/book-clubs", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBookClubs"] });
    },
  });
}

export function useUpdateProgressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ clubBookId, currentPage }: { clubBookId: string; currentPage: number }) => {
      const { data } = await api.patch<{ message: string }>(`/progress/me`, {
        clubBookId,
        currentPage,
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clubProgress", variables.clubBookId] });
      queryClient.invalidateQueries({ queryKey: ["clubDashboard"] });
    },
  });
}

export function useAcceptInviteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inviteId: string) => {
      const { data } = await api.patch(`/club-invites/${inviteId}/accept`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myPendingInvites"] });
      queryClient.invalidateQueries({ queryKey: ["myBookClubs"] });
    },
  });
}

export function useRejectInviteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inviteId: string) => {
      const { data } = await api.patch(`/club-invites/${inviteId}/reject`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myPendingInvites"] });
    },
  });
}

export function useCreateReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { clubId: string; clubBookId: string; rating: number; reviewText: string }) => {
      const { data } = await api.post(`/book-clubs/${payload.clubId}/books/${payload.clubBookId}/reviews`, {
        rating: payload.rating,
        reviewText: payload.reviewText
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clubReviews", variables.clubBookId] });
    },
  });
}

export function useAddBookToQueueMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { clubId: string; book: any; deadline: string }) => {
      // API may require mapping book structure to what Java expects
      const { data } = await api.post(`/book-clubs/${payload.clubId}/books`, {
        book: payload.book,
        deadline: payload.deadline
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clubBooksQueue", variables.clubId] });
      queryClient.invalidateQueries({ queryKey: ["clubDashboard", variables.clubId] });
    },
  });
}

export function useAdvanceBookMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (clubId: string) => {
      const { data } = await api.post(`/book-clubs/${clubId}/books/advance`);
      return data;
    },
    onSuccess: (_, clubId) => {
      queryClient.invalidateQueries({ queryKey: ["clubBooksQueue", clubId] });
      queryClient.invalidateQueries({ queryKey: ["clubDashboard", clubId] });
    },
  });
}
