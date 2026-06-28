const FOOTER_COLS = [
  {
    heading: "Travel",
    links: ["Find a village", "Experiences", "How booking works", "Gift a stay"],
  },
  {
    heading: "Villages",
    links: ["List your homestay", "Become a guide", "Curation standards", "BUMDes payouts"],
  },
  {
    heading: "DesaKu",
    links: ["The 50/30/20 model", "Impact reports", "About", "Contact"],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-palm-deep text-paper/80">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <span className="font-display text-3xl font-bold tracking-[-0.04em] text-paper">
              Desa<span className="text-gold">Ku</span>
            </span>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/65">
              A booking platform for certified Indonesian villages. Money stays
              where the welcome comes from.
            </p>
            <div className="mt-6 flex gap-2 text-xs font-semibold tracking-wide">
              <span className="rounded-full bg-paper/10 px-3 py-1">EN</span>
              <span className="rounded-full px-3 py-1 text-paper/50">ID</span>
              <span className="rounded-full px-3 py-1 text-paper/50">日本語</span>
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
          <span>© {new Date().getFullYear()} DesaKu. Built with villages, not for them.</span>
          <span className="font-mono tracking-wide">50 host · 30 guide · 20 village</span>
        </div>
      </div>
    </footer>
  );
}
