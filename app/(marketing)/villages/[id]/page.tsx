import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BookingPanel } from "@/components/booking/booking-panel";
import { ReviewList } from "@/components/booking/review-list";
import { rupiah } from "@/lib/format";
import { getLang } from "@/lib/i18n-server";
import { translations } from "@/lib/i18n";

type Params = { params: Promise<{ id: string }> };

export default async function VillageDetailPage({ params }: Params) {
  const [{ id }, lang] = await Promise.all([params, getLang()]);
  const t = translations[lang];
  const supabase = await createSupabaseServerClient();

  const { data: villageData } = await supabase
    .from("villages")
    .select(
      "id, name, region, description, hero_image_url, sanitation_rating, bumdes_bank_account, " +
        "homestays(id, host_whatsapp_number, price_per_night, max_guests, amenities), " +
        "experiences(id, title, description, category, price_per_pax)",
    )
    .eq("id", id)
    .single();

  if (!villageData) notFound();

  const village = villageData as unknown as VillageDetailRow;
  const homestays = village.homestays ?? [];
  const experiences = village.experiences ?? [];

  type ReviewRow = { id: string; tourist_name: string; rating: number; comment: string | null; created_at: string };

  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("id, tourist_name, rating, comment, created_at")
    .in("homestay_id", homestays.length > 0 ? homestays.map((h) => h.id) : ["no-match"])
    .order("created_at", { ascending: false });

  const reviews = (reviewsData ?? []) as ReviewRow[];
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null;

  return (
    <div>
      {/* Banner */}
      <div
        className="relative flex min-h-[18rem] items-end bg-palm md:min-h-[24rem]"
        style={
          village.hero_image_url
            ? {
                backgroundImage: `linear-gradient(to top, rgba(20,16,10,0.7), rgba(20,16,10,0.1)), url(${village.hero_image_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-palm-deep">
            ★ Sanitation {village.sanitation_rating}/5
          </span>
          <h1 className="mt-4 font-display text-5xl font-bold tracking-tight text-paper">
            {village.name}
          </h1>
          {village.region && (
            <p className="mt-1 text-paper/80">{village.region}</p>
          )}
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 lg:grid-cols-[1.4fr_1fr]">
        {/* Left: story + experiences */}
        <div>
          {village.description && (
            <p className="max-w-prose text-lg leading-relaxed text-ink/80">
              {village.description}
            </p>
          )}

          <section className="mt-12">
            <h2 className="font-display text-2xl font-semibold text-ink">
              {t.village.whatToDo}
            </h2>
            {experiences.length === 0 ? (
              <p className="mt-4 text-muted-foreground">
                {t.village.noExp}
              </p>
            ) : (
              <ul className="mt-5 divide-y divide-line border-y border-line">
                {experiences.map((e) => (
                  <li key={e.id} className="flex items-start justify-between gap-4 py-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-display text-lg font-semibold text-ink">
                          {e.title}
                        </p>
                        {e.category && (
                          <span className="rounded-full border border-line px-2 py-0.5 text-xs uppercase tracking-wide text-palm">
                            {e.category}
                          </span>
                        )}
                      </div>
                      {e.description && (
                        <p className="mt-1 max-w-prose text-sm text-ink/70">
                          {e.description}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 font-mono text-sm text-ink">
                      {rupiah(Number(e.price_per_pax))}
                      <span className="text-muted-foreground">{t.explore.perPax}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Homestay reviews */}
          <section className="mt-12">
            <h2 className="font-display text-2xl font-semibold text-ink">{t.village.reviews}</h2>
            <div className="mt-5">
              <ReviewList reviews={reviews} avgRating={avgRating} noReviewsText={t.village.noReviews} />
            </div>
          </section>
        </div>

        {/* Right: sticky booking panel */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {homestays.length === 0 ? (
            <div className="rounded-xl border border-line bg-card p-6 text-muted-foreground">
              {t.village.noHomestay}
            </div>
          ) : (
            <BookingPanel homestays={homestays} experiences={experiences} />
          )}
        </div>
      </div>
    </div>
  );
}

export type BookingHomestay = {
  id: string;
  host_whatsapp_number: string;
  price_per_night: number;
  max_guests: number | null;
  amenities: Record<string, boolean> | null;
};

export type BookingExperience = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  price_per_pax: number;
};

type VillageDetailRow = {
  id: string;
  name: string;
  region: string | null;
  description: string | null;
  hero_image_url: string | null;
  sanitation_rating: number | null;
  bumdes_bank_account: string | null;
  homestays: BookingHomestay[];
  experiences: BookingExperience[];
};
