import { api } from "./api";
import type { BookDTO } from "@/src/types/book";

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
