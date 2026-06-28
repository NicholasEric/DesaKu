import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rupiah } from "@/lib/format";
import { ReviewList } from "@/components/booking/review-list";
import { ExperienceBookingPanel } from "@/components/booking/experience-booking-panel";
import { getLang } from "@/lib/i18n-server";
import { translations } from "@/lib/i18n";

type Params = { params: Promise<{ id: string }> };

type Review = {
  id: string; tourist_name: string; rating: number;
  comment: string | null; created_at: string;
};

export default async function ExperienceDetailPage({ params }: Params) {
  const [{ id }, lang] = await Promise.all([params, getLang()]);
  const t = translations[lang];
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("experiences")
    .select("id, title, description, category, price_per_pax, guide_whatsapp_number, villages(id, name, region, hero_image_url, sanitation_rating)")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const exp = data as unknown as {
    id: string; title: string; description: string | null;
    category: string | null; price_per_pax: number;
    guide_whatsapp_number: string;
    villages: { id: string; name: string; region: string | null; hero_image_url: string | null; sanitation_rating: number } | null;
  };

  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("id, tourist_name, rating, comment, created_at")
    .eq("experience_id", id)
    .order("created_at", { ascending: false });

  const reviews = (reviewsData ?? []) as Review[];
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null;

  const village = exp.villages;

  return (
    <div>
      {/* Banner */}
      <div
        className="relative flex min-h-[16rem] items-end bg-palm-deep md:min-h-[22rem]"
        style={
          village?.hero_image_url
            ? {
                backgroundImage: `linear-gradient(to top, rgba(20,16,10,0.75), rgba(20,16,10,0.1)), url(${village.hero_image_url})`,
                backgroundSize: "cover", backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-10">
          <div className="flex flex-wrap items-center gap-2">
            {exp.category && (
              <span className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-palm-deep uppercase tracking-wide">
                {exp.category}
              </span>
            )}
            {village && (
              <Link
                href={`/villages/${village.id}`}
                className="text-sm text-paper/80 hover:text-gold"
              >
                {village.name}{village.region ? `, ${village.region}` : ""}
              </Link>
            )}
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-paper sm:text-5xl">
            {exp.title}
          </h1>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-mono text-2xl text-paper">{rupiah(Number(exp.price_per_pax))}</span>
            <span className="text-paper/70">{t.booking.perPax}</span>
            {avgRating !== null && (
              <span className="ml-2 text-gold text-sm">
                ★ {avgRating.toFixed(1)} ({reviews.length})
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 lg:grid-cols-[1.5fr_1fr]">
        {/* Left */}
        <div>
          {exp.description && (
            <p className="max-w-prose text-lg leading-relaxed text-ink/80">
              {exp.description}
            </p>
          )}

          {village && (
            <div className="mt-10 flex items-center gap-4 rounded-xl border border-line bg-card p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t.expDetail.partOf}
                </p>
                <Link href={`/villages/${village.id}`}
                  className="font-display text-xl font-semibold text-ink hover:text-clay">
                  {village.name}
                </Link>
                {village.region && <p className="text-sm text-muted-foreground">{village.region}</p>}
              </div>
              <span className="ml-auto rounded-full bg-gold px-3 py-1 text-xs font-semibold text-palm-deep">
                ★ Sanitation {village.sanitation_rating}/5
              </span>
            </div>
          )}

          <section className="mt-12">
            <h2 className="font-display text-2xl font-semibold text-ink">{t.expDetail.reviews}</h2>
            <div className="mt-5">
              <ReviewList reviews={reviews} avgRating={avgRating} noReviewsText={t.village.noReviews} />
            </div>
          </section>
        </div>

        {/* Right — booking panel */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ExperienceBookingPanel experience={{ id: exp.id, title: exp.title, price_per_pax: exp.price_per_pax }} />
        </div>
      </div>
    </div>
  );
}
