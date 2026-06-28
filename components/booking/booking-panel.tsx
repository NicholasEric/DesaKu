"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  BookingHomestay,
  BookingExperience,
} from "@/app/(marketing)/villages/[id]/page";
import { createBooking } from "@/app/(marketing)/booking-actions";
import { calculateDistribution, REVENUE_SPLIT } from "@/lib/distribution";
import { rupiah, nightsBetween } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

function isoOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const SPLIT_ROWS = [
  { key: "host", label: "Host family", pct: REVENUE_SPLIT.host, bg: "bg-palm" },
  { key: "guide", label: "Guide & artisans", pct: REVENUE_SPLIT.guide, bg: "bg-clay" },
  { key: "bumdes", label: "Village fund", pct: REVENUE_SPLIT.bumdes, bg: "bg-gold" },
] as const;

export function BookingPanel({
  homestays,
  experiences,
}: {
  homestays: BookingHomestay[];
  experiences: BookingExperience[];
}) {
  const router = useRouter();
  const [homestayId, setHomestayId] = useState(homestays[0].id);
  const [checkIn, setCheckIn] = useState(isoOffset(7));
  const [checkOut, setCheckOut] = useState(isoOffset(9));
  const [guests, setGuests] = useState(2);
  const [selectedExp, setSelectedExp] = useState<string[]>([]);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const homestay = homestays.find((h) => h.id === homestayId) ?? homestays[0];
  const nights = nightsBetween(checkIn, checkOut);

  const { lodging, experiencesTotal, total, split } = useMemo(() => {
    const lodging = Number(homestay.price_per_night) * nights;
    const experiencesTotal = experiences
      .filter((e) => selectedExp.includes(e.id))
      .reduce((sum, e) => sum + Number(e.price_per_pax) * guests, 0);
    const total = lodging + experiencesTotal;
    return {
      lodging,
      experiencesTotal,
      total,
      split: calculateDistribution(total),
    };
  }, [homestay, nights, experiences, selectedExp, guests]);

  function toggleExp(id: string, on: boolean) {
    setSelectedExp((prev) =>
      on ? [...new Set([...prev, id])] : prev.filter((x) => x !== id),
    );
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createBooking({
        homestayId,
        experienceIds: selectedExp,
        checkIn,
        checkOut,
        guests,
        guestName,
        guestPhone,
      });
      if (res.ok) router.push(`/bookings/${res.bookingId}`);
      else setError(res.error);
    });
  }

  const canBook = nights >= 1 && guestName.trim().length > 0 && total > 0;

  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-2xl text-ink">
          {rupiah(Number(homestay.price_per_night))}
        </span>
        <span className="text-sm text-muted-foreground">per night</span>
      </div>

      {/* Homestay choice */}
      {homestays.length > 1 && (
        <div className="mt-5 space-y-2">
          <Label className="text-ink">Homestay</Label>
          <div className="space-y-2">
            {homestays.map((h, i) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setHomestayId(h.id)}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                  h.id === homestayId
                    ? "border-clay bg-clay/5"
                    : "border-line hover:border-ink/30"
                }`}
              >
                <span className="text-ink">
                  Homestay {i + 1}
                  <span className="text-muted-foreground">
                    {" "}· up to {h.max_guests ?? "—"} guests
                  </span>
                </span>
                <span className="font-mono text-ink">
                  {rupiah(Number(h.price_per_night))}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dates + guests */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="checkin" className="text-ink">Check-in</Label>
          <Input
            id="checkin"
            type="date"
            value={checkIn}
            min={isoOffset(0)}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="checkout" className="text-ink">Check-out</Label>
          <Input
            id="checkout"
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        <Label htmlFor="guests" className="text-ink">Guests</Label>
        <Input
          id="guests"
          type="number"
          min={1}
          max={homestay.max_guests ?? undefined}
          value={guests}
          onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
        />
      </div>

      {/* Experiences */}
      {experiences.length > 0 && (
        <div className="mt-5">
          <Label className="text-ink">Add experiences</Label>
          <div className="mt-2 space-y-2">
            {experiences.map((e) => (
              <label
                key={e.id}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-line px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2.5 text-ink">
                  <Checkbox
                    checked={selectedExp.includes(e.id)}
                    onCheckedChange={(v) => toggleExp(e.id, v === true)}
                  />
                  {e.title}
                </span>
                <span className="font-mono text-muted-foreground">
                  {rupiah(Number(e.price_per_pax))}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Guest details */}
      <div className="mt-5 grid gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-ink">Your name</Label>
          <Input
            id="name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Sarah Tan"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-ink">WhatsApp / phone</Label>
          <Input
            id="phone"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            placeholder="+65 8123 4567"
          />
        </div>
      </div>

      {/* Price summary */}
      <dl className="mt-6 space-y-1.5 border-t border-line pt-4 text-sm">
        <div className="flex justify-between text-ink/80">
          <dt>
            {rupiah(Number(homestay.price_per_night))} × {nights} night
            {nights === 1 ? "" : "s"}
          </dt>
          <dd className="font-mono">{rupiah(lodging)}</dd>
        </div>
        {experiencesTotal > 0 && (
          <div className="flex justify-between text-ink/80">
            <dt>Experiences × {guests} guest{guests === 1 ? "" : "s"}</dt>
            <dd className="font-mono">{rupiah(experiencesTotal)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-line pt-2 font-semibold text-ink">
          <dt>Total</dt>
          <dd className="font-mono">{rupiah(total)}</dd>
        </div>
      </dl>

      {/* The transparent split — shown BEFORE booking */}
      <div className="mt-5 rounded-lg bg-ink p-4 text-paper">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold">
          Where it goes
        </p>
        <div className="mt-3 flex h-2 overflow-hidden rounded-full">
          {SPLIT_ROWS.map((r) => (
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
              <dd className="font-mono text-paper">
                {rupiah(split[r.key])}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {error && <p className="mt-4 text-sm text-clay">{error}</p>}

      <Button
        onClick={submit}
        disabled={!canBook || pending}
        size="lg"
        className="mt-5 w-full rounded-full bg-clay text-base text-paper hover:bg-clay/90"
      >
        {pending ? "Reserving…" : "Reserve (mock payment)"}
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        No charge in the MVP. The host confirms on WhatsApp.
      </p>
    </div>
  );
}
