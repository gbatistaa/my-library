import { atom } from "jotai";
import type { BookDTO } from "@/src/types/book";

export const pendingSessionBookAtom = atom<BookDTO | null>(null);
