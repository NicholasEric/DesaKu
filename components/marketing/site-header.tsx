import Link from "next/link";
import { Button } from "@/components/ui/button";

const NAV = [
  { label: "The split", href: "#impact" },
  { label: "Experiences", href: "#experiences" },
  { label: "Curation", href: "#curation" },
  { label: "For villages", href: "#villages" },
];

export function SiteHeader() {
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
          {/* Language switcher is wired up in Step 6 (EN / ID / 日本語) */}
          <span className="hidden text-xs font-semibold tracking-wide text-muted-foreground sm:inline">
            EN
          </span>
          <Button
            asChild
            className="rounded-full bg-palm px-5 text-paper hover:bg-palm-deep"
          >
            <a href="#villages-list">Find a village</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
