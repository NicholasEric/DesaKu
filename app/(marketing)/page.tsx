import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ImpactModel } from "@/components/marketing/impact-model";
import { getLang } from "@/lib/i18n-server";
import { translations } from "@/lib/i18n";

const EXPERIENCES = [
  { n: "01", title: "Homestay with a coffee-farming family", cat: "Stay",     place: "Kintamani, Bali" },
  { n: "02", title: "Angklung & gamelan evening",            cat: "Music",    place: "Cijahe, West Java" },
  { n: "03", title: "Batik tulis, drawn from scratch",       cat: "Craft",    place: "Giriloyo, Yogyakarta" },
  { n: "04", title: "Sunrise walk across the rice terraces", cat: "Nature",   place: "Jatiluwih, Bali" },
  { n: "05", title: "Clay-pot cooking over a wood fire",     cat: "Culinary", place: "Penglipuran, Bali" },
  { n: "06", title: "Hand-weaving ikat on a back-strap loom",cat: "Craft",    place: "Sade, Lombok" },
];

export default async function MarketingPage() {
  const lang = await getLang();
  const t = translations[lang];

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-14 px-5 py-20 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-28">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-clay">
              <span className="h-px w-8 bg-clay" />
              {t.hero.badge}
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[0.98] tracking-[-0.03em] text-ink sm:text-6xl lg:text-7xl">
              {t.hero.headline}
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/70">
              {t.hero.sub}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-clay px-7 text-base text-paper hover:bg-clay/90"
              >
                <Link href="/villages">{t.hero.cta}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-ink/20 bg-transparent px-7 text-base text-ink hover:bg-ink hover:text-paper"
              >
                <a href="#villages">{t.hero.listCta}</a>
              </Button>
            </div>

            <dl className="mt-12 flex gap-10 border-t border-line pt-6">
              {t.hero.stats.map(([num, label]) => (
                <div key={label}>
                  <dt className="font-display text-3xl font-bold text-palm">{num}</dt>
                  <dd className="text-sm text-muted-foreground">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Editorial postcard preview */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="rotate-[-2deg] rounded-lg border border-ink/10 bg-card p-3">
              <div className="flex aspect-[4/5] flex-col justify-between rounded-md bg-palm p-6 text-paper">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/70">
                    Desa Penglipuran
                  </span>
                  <span className="font-mono text-sm text-gold">★ 5.0</span>
                </div>
                <div>
                  <p className="font-display text-3xl font-bold leading-tight">
                    Bamboo village,
                    <br />
                    Bangli, Bali
                  </p>
                  <p className="mt-3 text-sm text-paper/70">
                    Bamboo-walled lanes, a host who farms uphill, an evening of
                    gamelan two doors down.
                  </p>
                </div>
                <div className="flex items-end justify-between border-t border-paper/20 pt-4">
                  <div>
                    <span className="font-mono text-2xl font-semibold">Rp 285k</span>
                    <span className="text-sm text-paper/60"> / night</span>
                  </div>
                  <span className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-palm-deep">
                    Sanitation 5/5
                  </span>
                </div>
              </div>
            </div>

            {/* Concierge teaser chip */}
            <div className="absolute -bottom-5 -left-4 max-w-[15rem] rotate-[3deg] rounded-lg rounded-bl-sm border border-line bg-[#e7ffd9] p-3 text-sm text-palm-deep">
              <span className="block text-[0.7rem] font-semibold uppercase tracking-wide text-palm/70">
                WhatsApp · Pak Wayan
              </span>
              <span>Booking confirmed ✓ Sampai jumpa Friday, Sarah!</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Impact model (50/30/20) ──────────────────────────── */}
      <ImpactModel />

      {/* ── Experiences ──────────────────────────────────────── */}
      <section id="experiences" className="border-b border-line py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-clay">
              {t.expSection.eyebrow}
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              {t.expSection.headline}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink/70">
              {t.expSection.sub}
            </p>
          </div>

          <ul className="mt-14 grid gap-x-12 gap-y-2 md:grid-cols-2">
            {EXPERIENCES.map((x) => (
              <li
                key={x.n}
                className="group flex items-center gap-5 border-b border-line py-5 transition-colors hover:border-clay"
              >
                <span className="font-mono text-sm text-muted-foreground">{x.n}</span>
                <div className="flex-1">
                  <p className="font-display text-xl font-semibold text-ink transition-colors group-hover:text-clay">
                    {x.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{x.place}</p>
                </div>
                <span className="rounded-full border border-line px-3 py-1 text-xs font-medium uppercase tracking-wide text-palm">
                  {x.cat}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Curation ─────────────────────────────────────────── */}
      <section id="curation" className="border-b border-line bg-secondary py-24">
        <div className="mx-auto grid max-w-6xl gap-14 px-5 md:grid-cols-[1fr_1fr] md:items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-clay">
              {t.curation.eyebrow}
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              {t.curation.headline}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink/70">
              {t.curation.sub}
            </p>
          </div>

          <ul className="space-y-3">
            {t.curation.checklist.map((item) => (
              <li
                key={item}
                className="flex items-center gap-4 rounded-md border border-line bg-card px-5 py-4"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-palm text-sm text-paper">
                  ✓
                </span>
                <span className="text-ink/80">{item}</span>
              </li>
            ))}
            <li className="flex items-center justify-between px-5 pt-2">
              <span className="text-sm text-muted-foreground">{t.curation.minLabel}</span>
              <span className="font-display text-lg font-semibold text-palm">
                {t.curation.minValue}
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* ── WhatsApp concierge ───────────────────────────────── */}
      <section className="border-b border-line py-24">
        <div className="mx-auto grid max-w-6xl gap-14 px-5 md:grid-cols-[1fr_1fr] md:items-center">
          <div className="order-2 md:order-1">
            {/* Faux WhatsApp thread */}
            <div className="mx-auto max-w-sm rounded-xl border border-line bg-[#ece5d8] p-4">
              <div className="mb-3 flex items-center gap-3 border-b border-ink/10 pb-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-palm text-sm font-semibold text-paper">
                  W
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-ink">Pak Wayan · Host</p>
                  <p className="text-xs text-muted-foreground">via DesaKu Concierge</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="max-w-[80%] rounded-lg rounded-tl-sm bg-card px-3 py-2 text-sm text-ink/85">
                  Halo Pak Wayan! Sarah (2 guests) arrives Fri 12 Sep, leaves
                  Sun 14. She booked the batik workshop too.
                </div>
                <div className="ml-auto max-w-[80%] rounded-lg rounded-tr-sm bg-[#d6f3c4] px-3 py-2 text-sm text-palm-deep">
                  Sudah siap! Kamar bersih, sarapan jam 7. Terima kasih DesaKu 🙏
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-clay">
              {t.concierge.eyebrow}
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              {t.concierge.headline}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink/70">
              {t.concierge.sub}
            </p>
          </div>
        </div>
      </section>

      {/* ── Dual CTA ─────────────────────────────────────────── */}
      <section id="villages-list" className="py-24">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 md:grid-cols-5">
          {/* Travelers — larger */}
          <div className="flex flex-col justify-between rounded-xl bg-palm p-10 text-paper md:col-span-3 md:p-12">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                {t.cta.travelers}
              </span>
              <h3 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight">
                {t.cta.travelersHeadline}
              </h3>
              <p className="mt-4 max-w-md text-paper/75">
                {t.cta.travelersSub}
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="mt-10 w-fit rounded-full bg-gold px-7 text-base text-palm-deep hover:bg-gold/90"
            >
              <Link href="/villages">{t.cta.travelersBtn}</Link>
            </Button>
          </div>

          {/* Villages — smaller */}
          <div
            id="villages"
            className="flex flex-col justify-between rounded-xl border border-clay/30 bg-clay p-10 text-paper md:col-span-2 md:p-12"
          >
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-paper/80">
                {t.cta.villages}
              </span>
              <h3 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight">
                {t.cta.villagesHeadline}
              </h3>
              <p className="mt-4 text-paper/80">
                {t.cta.villagesSub}
              </p>
            </div>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="mt-10 w-fit rounded-full border-paper/40 bg-transparent px-7 text-base text-paper hover:bg-paper hover:text-clay"
            >
              <a href="#villages">{t.cta.villagesBtn}</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
