import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MIN_RATING_TO_LIST } from "@/lib/sanitation";
import { rupiah } from "@/lib/format";

export const metadata = {
  title: "Certified villages · DesaKu",
};

type VillageRow = {
  id: string;
  name: string;
  region: string | null;
  description: string | null;
  hero_image_url: string | null;
  sanitation_rating: number | null;
  homestays: { price_per_night: number }[];
  experiences: { id: string }[];
};

export default async function VillagesPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("villages")
    .select(
      "id, name, region, description, hero_image_url, sanitation_rating, homestays(price_per_night), experiences(id)",
    )
    .gte("sanitation_rating", MIN_RATING_TO_LIST)
    .order("created_at", { ascending: false });

  const villages = (data ?? []) as VillageRow[];

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <header className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-clay">
          Certified villages
        </span>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-tight text-ink">
          Pick a village.
        </h1>
        <p className="mt-4 text-lg text-ink/70">
          Every village here cleared the {MIN_RATING_TO_LIST}/5 sanitation bar.
          Choose a homestay, add the experiences you want, and you'll see the
          full split before you commit.
        </p>
      </header>

      {error && (
        <p className="mt-10 rounded-md border border-clay/40 bg-clay/10 px-4 py-3 text-sm text-clay">
          Couldn't load villages: {error.message}
        </p>
      )}

      {!error && villages.length === 0 && (
        <p className="mt-10 text-muted-foreground">
          No villages are live yet. Onboard one from the admin desk.
        </p>
      )}

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {villages.map((v) => {
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
                    ? {
                        backgroundImage: `url(${v.hero_image_url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              >
                <span className="absolute right-3 top-3 rounded-full bg-gold px-2.5 py-1 text-xs font-semibold text-palm-deep">
                  ★ {v.sanitation_rating}/5
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="font-display text-xl font-semibold text-ink group-hover:text-clay">
                    {v.name}
                  </h2>
                </div>
                {v.region && (
                  <p className="text-sm text-muted-foreground">{v.region}</p>
                )}
                {v.description && (
                  <p className="mt-3 line-clamp-2 text-sm text-ink/70">
                    {v.description}
                  </p>
                )}
                <div className="mt-auto flex items-end justify-between pt-5">
                  <span className="text-sm text-muted-foreground">
                    {v.experiences.length} experience
                    {v.experiences.length === 1 ? "" : "s"}
                  </span>
                  {minPrice !== null && (
                    <span className="font-mono text-sm text-ink">
                      from {rupiah(minPrice)}
                      <span className="text-muted-foreground"> /night</span>
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
