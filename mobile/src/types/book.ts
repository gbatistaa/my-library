export type BookStatus = "TO_READ" | "READING" | "COMPLETED" | "DROPPED";

export interface BookDTO {
  id: string;
  title: string;
  author: string;
  rating: number | null;
  pages: number;
  isbn: string | null;
  genre: string | null;
  status: BookStatus;
  coverUrl: string | null;
  startDate: string | null;
  finishDate: string | null;
  notes: string | null;
}
