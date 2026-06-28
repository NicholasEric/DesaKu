"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LangToggle } from "@/components/marketing/lang-toggle";
import { useT } from "@/components/lang-provider";

export function SiteHeader() {
  const t = useT();
  const NAV = [
    { label: t.nav.split,       href: "#impact" },
    { label: t.nav.experiences, href: "#experiences" },
    { label: t.nav.curation,    href: "#curation" },
    { label: t.nav.forVillages, href: "#villages" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold tracking-[-0.04em] text-ink">
            Desa<span className="text-clay">Ku</span>
          </span>
          <span className="hidden text-[0.7rem] font-medium uppercase tracking-[0.2em] text-muted-foreground sm:inline">
            Rural Indonesia
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink/70 transition-colors hover:text-clay"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LangToggle variant="header" />
          <Button
            asChild
            className="rounded-full bg-palm px-5 text-paper hover:bg-palm-deep"
          >
            <Link href="/villages">{t.nav.findVillage}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
