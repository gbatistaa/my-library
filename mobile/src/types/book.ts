export type BookStatus = "TO_READ" | "READING" | "COMPLETED" | "DROPPED";

export interface BookCategoryDTO {
  id: string;
  name: string;
  color?: string;
}

export interface BookDTO {
  id: string;
  googleBooksId?: string;
  title: string;
  author: string;
  rating: number | null;
  pages: number;
  pagesRead: number | null;
  isbn: string | null;
  categories: BookCategoryDTO[];
  status: BookStatus;
  coverUrl: string | null;
  startDate: string | null;
  finishDate: string | null;
  notes: string | null;
}

export interface CatalogBookDTO {
  id: string | null;
  googleBooksId: string;
  title: string;
  author: string;
  pages: number;
  coverUrl: string | null;
  description: string | null;
  publishedDate: string | null;
}

export interface SagaDTO {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  bookCount?: number;
}

export interface CategoryDTO {
  id: string;
  name: string;
  description?: string;
  color?: string;
}
