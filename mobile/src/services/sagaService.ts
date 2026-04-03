import { api } from "./api";
import type { SagaDTO, BookDTO } from "@/src/types/book";

export async function getSagas(): Promise<SagaDTO[]> {
  const { data } = await api.get<SagaDTO[]>("/sagas");
  return data ?? [];
}

export async function createSaga(payload: {
  name: string;
  description?: string;
  coverUrl?: string;
}): Promise<SagaDTO> {
  const { data } = await api.post<SagaDTO>("/sagas", payload);
  return data;
}

export async function getSagaById(id: string): Promise<SagaDTO> {
  const { data } = await api.get<SagaDTO>(`/sagas/${id}`);
  return data;
}

export async function getSagaBooks(id: string): Promise<BookDTO[]> {
  const { data } = await api.get<BookDTO[]>(`/sagas/${id}/books`);
  return data ?? [];
}

export async function deleteSaga(id: string): Promise<void> {
  await api.delete(`/sagas/${id}`);
}

export async function updateSaga(
  id: string,
  payload: { name?: string; description?: string; coverUrl?: string },
): Promise<SagaDTO> {
  const { data } = await api.put<SagaDTO>(`/sagas/${id}`, payload);
  return data;
}

export async function removeBookFromSaga(
  sagaId: string,
  bookId: string,
): Promise<void> {
  await api.delete(`/sagas/${sagaId}/books/${bookId}`);
}

export async function addBookToSaga(
  sagaId: string,
  bookId: string,
): Promise<SagaDTO> {
  const { data } = await api.patch<SagaDTO>(`/sagas/${sagaId}/books/${bookId}`);
  return data;
}
