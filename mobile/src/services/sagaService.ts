import { api } from "./api";
import type { SagaDTO } from "@/src/types/book";

export async function getSagas(): Promise<SagaDTO[]> {
  const { data } = await api.get<SagaDTO[]>("/sagas");
  return data ?? [];
}
