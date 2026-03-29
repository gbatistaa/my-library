import { atom } from "jotai";
import type { UserDTO } from "@/src/types/auth";

// ─── Pure state atoms — no logic, no API calls ──────────────────────────────

/** Authenticated user profile (null = not logged in) */
export const userAtom = atom<UserDTO | null>(null);

/** True while the initial session hydration is running */
export const isLoadingSessionAtom = atom<boolean>(true);

/** Derived: is user authenticated? */
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);
