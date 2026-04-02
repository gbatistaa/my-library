import { api } from "./api";
import type { CategoryDTO } from "@/src/types/book";

export async function getCategories(): Promise<CategoryDTO[]> {
  const { data } = await api.get<CategoryDTO[]>("/categories");
  return data ?? [];
}
