import { api } from "./api";
import type { SagaDTO } from "@/src/types/book";

export async function getSagas(): Promise<SagaDTO[]> {
  const { data } = await api.get<SagaDTO[]>("/sagas");
  return data ?? [];
}

export async function createSaga(payload: {
  name: string;
  description?: string;
}): Promise<SagaDTO> {
  const { data } = await api.post<SagaDTO>("/sagas", payload);
  return data;
}

export async function addBookToSaga(
  sagaId: string,
  bookId: string,
): Promise<SagaDTO> {
  const { data } = await api.patch<SagaDTO>(`/sagas/${sagaId}/books/${bookId}`);
  return data;
}
