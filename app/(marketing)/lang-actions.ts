"use server";

import { cookies } from "next/headers";
import type { Lang } from "@/lib/i18n";

export async function setLang(lang: Lang) {
  (await cookies()).set("desaku_lang", lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
