"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLang } from "@/app/(marketing)/lang-actions";
import { useLang } from "@/components/lang-provider";
import type { Lang } from "@/lib/i18n";

const OPTIONS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "id", label: "ID" },
  { code: "ja", label: "日本語" },
];

export function LangToggle({ variant = "header" }: { variant?: "header" | "footer" }) {
  const lang = useLang();
  const router = useRouter();
  const [, startTransition] = useTransition();

  function switchLang(next: Lang) {
    if (next === lang) return;
    startTransition(async () => {
      await setLang(next);
      router.refresh();
    });
  }

  if (variant === "footer") {
    return (
      <div className="flex gap-2 text-xs font-semibold tracking-wide">
        {OPTIONS.map((o) => (
          <button
            key={o.code}
            type="button"
            onClick={() => switchLang(o.code)}
            className={`rounded-full px-3 py-1 transition-colors ${
              lang === o.code
                ? "bg-paper/10 text-paper"
                : "text-paper/50 hover:text-paper/80"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-0.5 rounded-full border border-line bg-paper/50 px-1 py-1 sm:flex">
      {OPTIONS.map((o) => (
        <button
          key={o.code}
          type="button"
          onClick={() => switchLang(o.code)}
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors ${
            lang === o.code
              ? "bg-ink text-paper"
              : "text-ink/50 hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
