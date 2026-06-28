import { cookies } from "next/headers";
import type { Lang } from "@/lib/i18n";

export async function getLang(): Promise<Lang> {
  const val = (await cookies()).get("desaku_lang")?.value ?? "en";
  return (["en", "id", "ja"].includes(val) ? val : "en") as Lang;
}
