import { cookies } from "next/headers";

/**
 * Lightweight gate for the MVP admin area: a single shared passcode unlocks a
 * short-lived httpOnly cookie. This is intentionally not full auth — role-based
 * Supabase Auth replaces it in a later pass (see profiles.role).
 */
export const ADMIN_COOKIE = "desaku_admin";

export async function isAdminAuthed(): Promise<boolean> {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === "ok";
}
