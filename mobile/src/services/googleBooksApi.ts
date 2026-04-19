import axios from "axios";

const GOOGLE_BOOKS_BASE_URL = "https://www.googleapis.com/books/v1/volumes";

export interface GoogleBook {
  id: string;
  title: string;
  author: string;
  pages: number;
  coverUrl?: string;
  publishedDate?: string;
}

export async function searchGoogleBooks(query: string): Promise<GoogleBook[]> {
  if (!query.trim()) return [];
  
  try {
    const response = await axios.get(GOOGLE_BOOKS_BASE_URL, {
      params: {
        q: query,
        maxResults: 10,
        printType: "books",
      }
    });

    if (!response.data || !response.data.items) {
      return [];
    }

    return response.data.items.map((item: any) => {
      const info = item.volumeInfo;
      return {
        id: item.id,
        title: info.title || "Sem título",
        author: info.authors ? info.authors.join(", ") : "Desconhecido",
        pages: info.pageCount || 0,
        publishedDate: info.publishedDate,
        coverUrl: info.imageLinks?.thumbnail?.replace("http:", "https:") || undefined,
      };
    });
  } catch (error) {
    console.error("Error searching Google Books:", error);
    return [];
  }
}
