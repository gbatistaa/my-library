import { api } from "./api";
import type { CategoryDTO } from "@/src/types/book";

export async function getCategories(): Promise<CategoryDTO[]> {
  const { data } = await api.get<CategoryDTO[]>("/categories");
  return data ?? [];
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  color?: string;
}

export async function createCategory(payload: CreateCategoryPayload): Promise<CategoryDTO> {
  const { data } = await api.post<CategoryDTO>("/categories", payload);
  return data;
}
