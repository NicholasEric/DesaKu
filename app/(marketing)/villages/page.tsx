import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MIN_RATING_TO_LIST } from "@/lib/sanitation";
import { rupiah } from "@/lib/format";
import { getLang } from "@/lib/i18n-server";
import { translations } from "@/lib/i18n";

export const metadata = { title: "Explore · DesaKu" };

type Filter = "all" | "stay" | "experience";

const CAT_LABELS: Record<string, string> = {
  music: "Music", craft: "Craft", culinary: "Culinary",
  nature: "Nature", agriculture: "Agriculture", ritual: "Ritual",
};

type Props = { searchParams: Promise<{ type?: string }> };

type VillageRow = {
  id: string; name: string; region: string | null;
  description: string | null; hero_image_url: string | null;
  sanitation_rating: number | null;
  homestays: { id: string; price_per_night: number }[];
  experiences: { id: string }[];
};

type ExperienceRow = {
  id: string; title: string; description: string | null;
  category: string | null; price_per_pax: number; village_id: string;
  villages: { id: string; name: string; region: string | null } | null;
};

export default async function ExplorePage({ searchParams }: Props) {
  const [{ type = "all" }, lang] = await Promise.all([searchParams, getLang()]);
  const t = translations[lang];
  const filter = (["all", "stay", "experience"].includes(type) ? type : "all") as Filter;

  const FILTER_TABS: { key: Filter; label: string }[] = [
    { key: "all",        label: t.explore.all },
    { key: "stay",       label: t.explore.stay },
    { key: "experience", label: t.explore.experience },
  ];

  const supabase = await createSupabaseServerClient();

  const [villagesRes, experiencesRes] = await Promise.all([
    supabase
      .from("villages")
      .select("id, name, region, description, hero_image_url, sanitation_rating, homestays(id, price_per_night), experiences(id)")
      .gte("sanitation_rating", MIN_RATING_TO_LIST)
      .order("created_at", { ascending: false }),

    supabase
      .from("experiences")
      .select("id, title, description, category, price_per_pax, village_id, villages(id, name, region, sanitation_rating)")
      .order("created_at", { ascending: false }),
  ]);

  const allVillages = (villagesRes.data ?? []) as unknown as VillageRow[];
  const allExperiences = (experiencesRes.data ?? []) as unknown as (ExperienceRow & {
    villages: { id: string; name: string; region: string | null; sanitation_rating: number } | null;
  })[];

  const experiences = allExperiences.filter(
    (e) => (e.villages?.sanitation_rating ?? 0) >= MIN_RATING_TO_LIST,
  );

  const showStays = filter === "all" || filter === "stay";
  const showExperiences = filter === "all" || filter === "experience";

  const stayVillages = showStays
    ? allVillages.filter((v) => v.homestays.length > 0)
    : [];
  const expList = showExperiences ? experiences : [];

  const totalCount = stayVillages.length + expList.length;

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <header className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-clay">
          {t.explore.badge}
        </span>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-tight text-ink">
          {t.explore.headline}
        </h1>
        <p className="mt-4 text-lg text-ink/70">
          {t.explore.sub}
        </p>
      </header>

      {/* Filter tabs */}
      <div className="mt-10 flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/villages?type=${tab.key}`}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === tab.key
                ? "border-ink bg-ink text-paper"
                : "border-line bg-card text-ink hover:border-ink/40"
            }`}
          >
            {tab.label}
          </Link>
        ))}
        <span className="ml-auto self-center text-sm text-muted-foreground">
          {t.explore.results(totalCount)}
        </span>
      </div>

      {totalCount === 0 && (
        <p className="mt-14 text-muted-foreground">
          {t.explore.empty}{" "}
          <Link href="/admin" className="underline">admin desk</Link>.
        </p>
      )}

      {/* ── Stays ──────────────────────────────────────────────────── */}
      {stayVillages.length > 0 && (
        <section className="mt-12">
          {filter === "all" && (
            <h2 className="mb-6 font-display text-2xl font-semibold text-ink">
              {t.explore.staysSection}
            </h2>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stayVillages.map((v) => {
              const prices = v.homestays.map((h) => Number(h.price_per_night));
              const minPrice = prices.length ? Math.min(...prices) : null;
              return (
                <Link
                  key={v.id}
                  href={`/villages/${v.id}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-line bg-card transition-colors hover:border-clay"
                >
                  <div
                    className="relative aspect-[4/3] bg-palm"
                    style={
                      v.hero_image_url
                        ? { backgroundImage: `url(${v.hero_image_url})`, backgroundSize: "cover", backgroundPosition: "center" }
                        : undefined
                    }
                  >
                    <span className="absolute left-3 top-3 rounded-full bg-ink/60 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-paper">
                      Stay
                    </span>
                    <span className="absolute right-3 top-3 rounded-full bg-gold px-2.5 py-1 text-xs font-semibold text-palm-deep">
                      ★ {v.sanitation_rating}/5
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-xl font-semibold text-ink group-hover:text-clay">
                      {v.name}
                    </h3>
                    {v.region && <p className="text-sm text-muted-foreground">{v.region}</p>}
                    {v.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-ink/70">{v.description}</p>
                    )}
                    <div className="mt-auto flex items-end justify-between pt-4">
                      <span className="text-sm text-muted-foreground">
                        {t.explore.expCount(v.experiences.length)}
                      </span>
                      {minPrice !== null && (
                        <span className="font-mono text-sm text-ink">
                          {t.explore.fromPrice} {rupiah(minPrice)}<span className="text-muted-foreground">{t.explore.perNight}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Experiences ────────────────────────────────────────────── */}
      {expList.length > 0 && (
        <section className={stayVillages.length > 0 ? "mt-16" : "mt-12"}>
          {filter === "all" && (
            <h2 className="mb-6 font-display text-2xl font-semibold text-ink">
              {t.explore.expSection}
            </h2>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {expList.map((e) => (
              <Link
                key={e.id}
                href={`/experiences/${e.id}`}
                className="group flex flex-col gap-3 rounded-xl border border-line bg-card p-5 transition-colors hover:border-palm"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-full border border-line px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-palm">
                    {CAT_LABELS[e.category ?? ""] ?? e.category ?? "Experience"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {e.villages?.name ?? ""}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold leading-tight text-ink group-hover:text-palm">
                  {e.title}
                </h3>
                {e.description && (
                  <p className="line-clamp-2 text-sm text-ink/70">{e.description}</p>
                )}
                <div className="mt-auto flex items-center justify-between border-t border-line pt-3">
                  <span className="text-xs text-muted-foreground">
                    {e.villages?.region ?? ""}
                  </span>
                  <span className="font-mono text-sm text-ink">
                    {rupiah(Number(e.price_per_pax))}<span className="text-muted-foreground">{t.explore.perPax}</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
