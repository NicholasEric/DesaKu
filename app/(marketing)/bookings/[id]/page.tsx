import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rupiah, nightsBetween } from "@/lib/format";
import { ReviewForm } from "@/components/booking/review-form";
import { getLang } from "@/lib/i18n-server";
import { translations } from "@/lib/i18n";

type Params = { params: Promise<{ id: string }> };

type Dist = {
  host_amount: number;
  guide_amount: number;
  bumdes_amount: number;
  status: string;
};

type BookingRow = {
  id: string;
  guest_name: string | null;
  check_in: string;
  check_out: string;
  total_amount: number;
  status: string;
  experience_ids: string[] | null;
  homestays: {
    price_per_night: number;
    host_whatsapp_number: string;
    villages: { name: string; region: string | null } | null;
  } | null;
  distributions: Dist | Dist[] | null;
};

export default async function BookingConfirmationPage({ params }: Params) {
  const [{ id }, lang] = await Promise.all([params, getLang()]);
  const t = translations[lang];
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("bookings")
    .select(
      "id, guest_name, check_in, check_out, total_amount, status, experience_ids, " +
        "homestays(price_per_night, host_whatsapp_number, villages(name, region)), " +
        "distributions(host_amount, guide_amount, bumdes_amount, status)",
    )
    .eq("id", id)
    .single();

  if (!data) notFound();

  const booking = data as unknown as BookingRow;
  const homestay = booking.homestays;
  const village = homestay?.villages ?? null;

  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", id)
    .single();

  const dist = Array.isArray(booking.distributions)
    ? booking.distributions[0]
    : booking.distributions;

  const statusLabel = t.confirmation.statusLabels[booking.status as keyof typeof t.confirmation.statusLabels]
    ?? t.confirmation.statusLabels.pending;
  const statusNote  = t.confirmation.statusNotes[booking.status as keyof typeof t.confirmation.statusNotes]
    ?? t.confirmation.statusNotes.pending;

  const nights = nightsBetween(booking.check_in, booking.check_out);

  const splitRows = dist
    ? [
        { label: t.booking.host,    pct: 50, amount: dist.host_amount,   bg: "bg-palm" },
        { label: t.booking.guide,   pct: 30, amount: dist.guide_amount,  bg: "bg-clay" },
        { label: t.booking.village, pct: 20, amount: dist.bumdes_amount, bg: "bg-gold" },
      ]
    : [];

  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-clay">
        {t.confirmation.status}
      </span>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink">
        {t.confirmation.greeting(booking.guest_name?.split(" ")[0] ?? "traveller")}
      </h1>
      <p className="mt-3 text-lg text-ink/70">{statusNote}</p>

      <div className="mt-10 rounded-xl border border-line bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-2xl font-semibold text-ink">
              {village?.name ?? "Homestay"}
            </p>
            {village?.region && (
              <p className="text-sm text-muted-foreground">{village.region}</p>
            )}
          </div>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-palm-deep">
            {statusLabel}
          </span>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">{t.confirmation.checkin}</dt>
            <dd className="text-ink">{booking.check_in}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t.confirmation.checkout}</dt>
            <dd className="text-ink">
              {booking.check_out}{" "}
              <span className="text-muted-foreground">
                ({t.booking.nights(nights)})
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t.confirmation.experiences}</dt>
            <dd className="text-ink">{booking.experience_ids?.length ?? 0} added</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t.confirmation.total}</dt>
            <dd className="font-mono text-ink">{rupiah(Number(booking.total_amount))}</dd>
          </div>
        </dl>
      </div>

      {splitRows.length > 0 && (
        <div className="mt-6 rounded-xl bg-ink p-6 text-paper">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold">
            {t.confirmation.moneyLabel}
          </p>
          <div className="mt-4 flex h-2.5 overflow-hidden rounded-full">
            {splitRows.map((r) => (
              <div key={r.label} style={{ width: `${r.pct}%` }} className={r.bg} />
            ))}
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            {splitRows.map((r) => (
              <div key={r.label} className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-paper/80">
                  <span className={`h-2.5 w-2.5 rounded-full ${r.bg}`} />
                  {r.label} · {r.pct}%
                </dt>
                <dd className="font-mono text-paper">{rupiah(Number(r.amount))}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {(booking.status === "confirmed" || booking.status === "completed") && (
        <div className="mt-10">
          {existingReview ? (
            <div className="rounded-xl border border-palm/30 bg-palm/5 p-6">
              <p className="font-display text-xl font-semibold text-palm">
                {t.confirmation.alreadyReviewed}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.confirmation.alreadyReviewedNote}
              </p>
            </div>
          ) : (
            <ReviewForm bookingId={id} />
          )}
        </div>
      )}

      <Link
        href="/villages"
        className="mt-10 inline-block text-sm font-medium text-palm hover:text-clay"
      >
        {t.confirmation.back}
      </Link>
    </div>
  );
}
