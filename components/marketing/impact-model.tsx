"use client";

import { useT } from "@/components/lang-provider";

const EXAMPLE_TOTAL = 1_000_000;

const SPLIT_META = [
  { pct: 50, key: "host"   as const, bg: "bg-palm", text: "text-paper" },
  { pct: 30, key: "guide"  as const, bg: "bg-clay", text: "text-paper" },
  { pct: 20, key: "bumdes" as const, bg: "bg-gold",  text: "text-palm-deep" },
] as const;

function rupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export function ImpactModel() {
  const t = useT();

  const SPLIT = [
    { ...SPLIT_META[0], label: t.impact.host,   blurb: t.impact.hostBlurb },
    { ...SPLIT_META[1], label: t.impact.guide,  blurb: t.impact.guideBlurb },
    { ...SPLIT_META[2], label: t.impact.village, blurb: t.impact.villageBlurb },
  ];

  const [headline, ...rest] = t.impact.headline.split("\n");

  return (
    <section id="impact" className="bg-ink py-24 text-paper">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-10 md:grid-cols-[1fr_1.1fr] md:items-end">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              {t.impact.eyebrow}
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-paper sm:text-5xl">
              {headline}
              {rest.length > 0 && <><br />{rest.join("\n")}</>}
            </h2>
          </div>
          <p className="text-lg leading-relaxed text-paper/70">
            {t.impact.sub}
          </p>
        </div>

        {/* Proportional split bar */}
        <div className="mt-14">
          <div className="flex items-center justify-between text-sm text-paper/60">
            <span>{t.impact.example}</span>
            <span className="font-mono text-paper">{rupiah(EXAMPLE_TOTAL)}</span>
          </div>

          <div className="mt-4 flex min-h-[20rem] flex-col gap-1.5 md:h-44 md:min-h-0 md:flex-row">
            {SPLIT.map((seg) => (
              <div
                key={seg.key}
                style={{ flexGrow: seg.pct }}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-md p-5 transition-[flex-grow] duration-500 ${seg.bg} ${seg.text}`}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-5xl font-bold leading-none">
                    {seg.pct}
                    <span className="text-2xl">%</span>
                  </span>
                  <span className="font-mono text-sm opacity-80">
                    {rupiah((EXAMPLE_TOTAL * seg.pct) / 100)}
                  </span>
                </div>
                <span className="text-sm font-semibold uppercase tracking-wide">
                  {seg.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Detail rows */}
        <dl className="mt-12 grid gap-px overflow-hidden rounded-lg border border-paper/15 bg-paper/15 md:grid-cols-3">
          {SPLIT.map((seg) => (
            <div key={seg.key} className="bg-ink p-6">
              <dt className="flex items-center gap-2.5">
                <span className={`h-3 w-3 rounded-full ${seg.bg}`} />
                <span className="font-display text-lg font-semibold text-paper">
                  {seg.label}
                </span>
              </dt>
              <dd className="mt-3 text-sm leading-relaxed text-paper/65">
                {seg.blurb}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
