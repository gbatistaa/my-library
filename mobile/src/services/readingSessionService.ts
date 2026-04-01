import { api } from "./api";
import type {
  ReadingSessionDTO,
  CreateReadingSessionDTO,
  PaginatedReadingSessions,
} from "../types/readingSession";

export async function submitReadingSession(
  data: CreateReadingSessionDTO,
): Promise<ReadingSessionDTO> {
  const response = await api.post<ReadingSessionDTO>("/reading-sessions", data);
  return response.data;
}

export async function fetchRecentReadingSessions(): Promise<
  ReadingSessionDTO[]
> {
  // Use the history endpoint but pass size=3 page=0 to get just the latest 3
  const response = await api.get<PaginatedReadingSessions>(
    "/reading-sessions/history?page=0&size=3",
  );
  return response.data?.content ?? [];
}

export async function fetchReadingSessionHistory(
  page: number = 0,
  size: number = 10,
): Promise<PaginatedReadingSessions> {
  const response = await api.get<PaginatedReadingSessions>(
    `/reading-sessions/history?page=${page}&size=${size}`,
  );
  return (
    response.data ?? {
      content: [],
      pageable: { pageNumber: 0, pageSize: 10 },
      totalElements: 0,
      totalPages: 0,
      last: true,
      first: true,
      empty: true,
    }
  );
}
