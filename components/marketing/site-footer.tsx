"use client";

import { useT } from "@/components/lang-provider";
import { LangToggle } from "@/components/marketing/lang-toggle";

export function SiteFooter() {
  const t = useT();
  const FOOTER_COLS = [
    { heading: t.footer.travel,   links: t.footer.travelLinks },
    { heading: t.footer.villages, links: t.footer.villageLinks },
    { heading: t.footer.desaku,   links: t.footer.desaKuLinks },
  ];

  return (
    <footer className="mt-auto bg-palm-deep text-paper/80">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <span className="font-display text-3xl font-bold tracking-[-0.04em] text-paper">
              Desa<span className="text-gold">Ku</span>
            </span>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/65">
              {t.footer.tagline}
            </p>
            <div className="mt-6">
              <LangToggle variant="footer" />
            </div>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.heading}>
              <h4 className="font-display text-sm font-semibold tracking-wide text-paper">
                {col.heading}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-paper/65 transition-colors hover:text-gold"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-paper/15 pt-6 text-xs text-paper/50 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} DesaKu. {t.footer.copyright}</span>
          <span className="font-mono tracking-wide">50 host · 30 guide · 20 village</span>
        </div>
      </div>
    </footer>
  );
}
