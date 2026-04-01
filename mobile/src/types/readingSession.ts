export interface ReadingSessionDTO {
  id: string;
  pagesRead: number;
  durationSeconds: number;
  bookId: string;
  bookTitle?: string;
  bookCoverUrl?: string;
  createdAt: string; // ISO date string
}

export interface CreateReadingSessionDTO {
  pagesRead: number;
  durationSeconds: number;
  bookId: string;
}

export interface PaginatedReadingSessions {
  content: ReadingSessionDTO[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  empty: boolean;
}
