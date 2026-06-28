"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBooking } from "@/app/(marketing)/booking-actions";
import { calculateDistribution, REVENUE_SPLIT } from "@/lib/distribution";
import { rupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { useT } from "@/components/lang-provider";

function isoOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const SPLIT_KEYS = [
  { key: "host"   as const, pct: REVENUE_SPLIT.host,   bg: "bg-palm" },
  { key: "guide"  as const, pct: REVENUE_SPLIT.guide,  bg: "bg-clay" },
  { key: "bumdes" as const, pct: REVENUE_SPLIT.bumdes, bg: "bg-gold" },
];

type Props = {
  experience: { id: string; title: string; price_per_pax: number };
};

export function ExperienceBookingPanel({ experience }: Props) {
  const t = useT();
  const router = useRouter();

  const [visitDate, setVisitDate]   = useState(isoOffset(7));
  const [guests, setGuests]         = useState(2);
  const [guestName, setGuestName]   = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [error, setError]           = useState<string | null>(null);
  const [pending, startTransition]  = useTransition();

  const { total, split } = useMemo(() => {
    const total = Number(experience.price_per_pax) * guests;
    return { total, split: calculateDistribution(total) };
  }, [experience.price_per_pax, guests]);

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createBooking({
        bookingType: "experience",
        homestayId: null,
        experienceIds: [experience.id],
        checkIn: visitDate,
        checkOut: visitDate,
        guests,
        guestName,
        guestPhone,
      });
      if (res.ok) router.push(`/bookings/${res.bookingId}`);
      else setError(res.error);
    });
  }

  const SPLIT_ROWS = [
    { key: "host"   as const, label: t.booking.host,    pct: REVENUE_SPLIT.host,   bg: "bg-palm" },
    { key: "guide"  as const, label: t.booking.guide,   pct: REVENUE_SPLIT.guide,  bg: "bg-clay" },
    { key: "bumdes" as const, label: t.booking.village, pct: REVENUE_SPLIT.bumdes, bg: "bg-gold" },
  ];

  const canBook = guestName.trim().length > 0 && total > 0;

  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-2xl text-ink">
          {rupiah(Number(experience.price_per_pax))}
        </span>
        <span className="text-sm text-muted-foreground">{t.booking.perPax}</span>
      </div>

      <div className="mt-5 space-y-1.5">
        <Label htmlFor="visitdate" className="text-ink">{t.booking.visitDate}</Label>
        <Input
          id="visitdate" type="date" value={visitDate} min={isoOffset(0)}
          onChange={(e) => setVisitDate(e.target.value)}
        />
      </div>

      <div className="mt-3 space-y-1.5">
        <Label htmlFor="guests" className="text-ink">{t.booking.pax}</Label>
        <Input
          id="guests" type="number" min={1} value={guests}
          onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
        />
      </div>

      <div className="mt-5 grid gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-ink">{t.booking.name}</Label>
          <Input id="name" value={guestName}
            onChange={(e) => setGuestName(e.target.value)} placeholder="Sarah Tan" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-ink">{t.booking.phone}</Label>
          <PhoneInput id="phone" value={guestPhone} onChange={setGuestPhone} placeholder="8123 4567" />
        </div>
      </div>

      <dl className="mt-6 space-y-1.5 border-t border-line pt-4 text-sm">
        <div className="flex justify-between text-ink/80">
          <dt>{rupiah(Number(experience.price_per_pax))} × {guests} pax</dt>
          <dd className="font-mono">{rupiah(total)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-2 font-semibold text-ink">
          <dt>{t.booking.total}</dt>
          <dd className="font-mono">{rupiah(total)}</dd>
        </div>
      </dl>

      {total > 0 && (
        <div className="mt-5 rounded-lg bg-ink p-4 text-paper">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold">{t.booking.whereItGoes}</p>
          <div className="mt-3 flex h-2 overflow-hidden rounded-full">
            {SPLIT_KEYS.map((r) => (
              <div key={r.key} style={{ width: `${r.pct * 100}%` }} className={r.bg} />
            ))}
          </div>
          <dl className="mt-3 space-y-1 text-sm">
            {SPLIT_ROWS.map((r) => (
              <div key={r.key} className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-paper/80">
                  <span className={`h-2.5 w-2.5 rounded-full ${r.bg}`} />
                  {r.label} · {r.pct * 100}%
                </dt>
                <dd className="font-mono text-paper">{rupiah(split[r.key])}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-clay">{error}</p>}

      <Button
        onClick={submit} disabled={!canBook || pending} size="lg"
        className="mt-5 w-full rounded-full bg-clay text-base text-paper hover:bg-clay/90"
      >
        {pending ? t.booking.reserving : t.booking.reserve}
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        {t.booking.noChargeExp}
      </p>
    </div>
  );
}
