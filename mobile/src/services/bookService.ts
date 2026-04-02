import { api } from "./api";
import type { BookDTO, BookStatus } from "@/src/types/book";

export interface CreateBookPayload {
  title: string;
  author: string;
  pages: number;
  pagesRead?: number;
  isbn: string;
  genre: string;
  status: BookStatus;
  rating?: number;
  notes?: string;
  coverUrl?: string;
}

export async function createBook(payload: CreateBookPayload): Promise<BookDTO> {
  const { data } = await api.post<BookDTO>("/books", payload);
  return data;
}

export async function searchBooks(title: string): Promise<BookDTO[]> {
  const { data } = await api.get<{ content: BookDTO[] }>("/books/search", {
    params: { title, page: 0, size: 20 },
  });
  return data?.content ?? [];
}

export async function getAllBooks(params?: { genre?: string }): Promise<BookDTO[]> {
  const { data } = await api.get<{ content: BookDTO[] }>("/books", {
    params: { ...params, page: 0, size: 100 },
  });
  return data?.content ?? [];
}

/**
 * Fetches books the user is currently reading (status = READING).
 * Returns array of books.
 */
export async function getCurrentlyReading(): Promise<BookDTO[]> {
  const { data } = await api.get<{ content: BookDTO[] }>("/books", {
    params: { status: "READING", page: 0, size: 5 },
  });
  return data?.content ?? [];
}

/**
 * Fetches books currently reading in paginated format.
 */
export async function getCurrentlyReadingBooks(): Promise<{
  content: BookDTO[];
}> {
  const { data } = await api.get<{ content: BookDTO[] }>("/books", {
    params: { status: "READING", page: 0, size: 100 }, // Get all for selection
  });
  return data ?? { content: [] };
}
