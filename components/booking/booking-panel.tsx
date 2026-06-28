"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  BookingHomestay,
  BookingExperience,
} from "@/app/(marketing)/villages/[id]/page";
import { createBooking, type BookingType } from "@/app/(marketing)/booking-actions";
import { calculateDistribution, REVENUE_SPLIT } from "@/lib/distribution";
import { rupiah, nightsBetween } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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

type Mode = "stay" | "experience";

export function BookingPanel({
  homestays,
  experiences,
}: {
  homestays: BookingHomestay[];
  experiences: BookingExperience[];
}) {
  const t = useT();
  const router = useRouter();

  const hasStay = homestays.length > 0;
  const hasExp  = experiences.length > 0;

  const [mode, setMode]               = useState<Mode>(hasStay ? "stay" : "experience");
  const [homestayId, setHomestayId]   = useState(homestays[0]?.id ?? "");
  const [checkIn, setCheckIn]         = useState(isoOffset(7));
  const [checkOut, setCheckOut]       = useState(isoOffset(9));
  const [visitDate, setVisitDate]     = useState(isoOffset(7));
  const [guests, setGuests]           = useState(2);
  const [selectedExp, setSelectedExp] = useState<string[]>([]);
  const [guestName, setGuestName]     = useState("");
  const [guestPhone, setGuestPhone]   = useState("");
  const [error, setError]             = useState<string | null>(null);
  const [pending, startTransition]    = useTransition();

  const homestay = homestays.find((h) => h.id === homestayId) ?? homestays[0];
  const nights = nightsBetween(checkIn, checkOut);

  const { lodging, experiencesTotal, total, split } = useMemo(() => {
    const lodging = mode === "stay" && homestay
      ? Number(homestay.price_per_night) * Math.max(0, nights)
      : 0;
    const experiencesTotal = experiences
      .filter((e) => selectedExp.includes(e.id))
      .reduce((sum, e) => sum + Number(e.price_per_pax) * guests, 0);
    const total = lodging + experiencesTotal;
    return { lodging, experiencesTotal, total, split: calculateDistribution(total) };
  }, [mode, homestay, nights, experiences, selectedExp, guests]);

  function toggleExp(id: string, on: boolean) {
    setSelectedExp((prev) => on ? [...new Set([...prev, id])] : prev.filter((x) => x !== id));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const bookingType: BookingType =
        mode === "experience" ? "experience"
        : selectedExp.length > 0 ? "bundle"
        : "stay";

      const res = await createBooking({
        bookingType,
        homestayId: mode === "stay" ? homestayId : null,
        experienceIds: selectedExp,
        checkIn:  mode === "stay" ? checkIn : visitDate,
        checkOut: mode === "stay" ? checkOut : visitDate,
        guests,
        guestName,
        guestPhone,
      });

      if (res.ok) router.push(`/bookings/${res.bookingId}`);
      else setError(res.error);
    });
  }

  const SPLIT_ROWS = [
    { key: "host"   as const, label: t.booking.host,   pct: REVENUE_SPLIT.host,   bg: "bg-palm" },
    { key: "guide"  as const, label: t.booking.guide,  pct: REVENUE_SPLIT.guide,  bg: "bg-clay" },
    { key: "bumdes" as const, label: t.booking.village, pct: REVENUE_SPLIT.bumdes, bg: "bg-gold" },
  ];

  const canBook =
    guestName.trim().length > 0 &&
    (mode === "stay" ? nights >= 1 && !!homestay : selectedExp.length > 0) &&
    total > 0;

  return (
    <div className="rounded-2xl border border-line bg-card p-6">

      {hasStay && hasExp && (
        <div className="mb-5 flex overflow-hidden rounded-lg border border-line text-sm">
          {(["stay", "experience"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setSelectedExp([]); }}
              className={`flex-1 py-2 font-medium transition-colors ${
                mode === m
                  ? "bg-ink text-paper"
                  : "bg-transparent text-muted-foreground hover:text-ink"
              }`}
            >
              {m === "stay" ? t.booking.overnight : t.booking.dayVisit}
            </button>
          ))}
        </div>
      )}

      {/* ── STAY mode ─────────────────────────────────────────── */}
      {mode === "stay" && (
        <>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl text-ink">
              {homestay ? rupiah(Number(homestay.price_per_night)) : "—"}
            </span>
            <span className="text-sm text-muted-foreground">{t.booking.perNight}</span>
          </div>

          {homestays.length > 1 && (
            <div className="mt-4 space-y-2">
              <Label className="text-ink">{t.booking.homestay}</Label>
              {homestays.map((h, i) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setHomestayId(h.id)}
                  className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                    h.id === homestayId ? "border-clay bg-clay/5" : "border-line hover:border-ink/30"
                  }`}
                >
                  <span className="text-ink">
                    Homestay {i + 1}
                    <span className="text-muted-foreground"> · {t.booking.upTo} {h.max_guests ?? "—"} {t.booking.guestsUnit}</span>
                  </span>
                  <span className="font-mono text-ink">{rupiah(Number(h.price_per_night))}</span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="checkin" className="text-ink">{t.booking.checkin}</Label>
              <Input id="checkin" type="date" value={checkIn} min={isoOffset(0)}
                onChange={(e) => setCheckIn(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="checkout" className="text-ink">{t.booking.checkout}</Label>
              <Input id="checkout" type="date" value={checkOut} min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)} />
            </div>
          </div>
        </>
      )}

      {/* ── EXPERIENCE mode ───────────────────────────────────── */}
      {mode === "experience" && (
        <div className="mt-1 space-y-1.5">
          <Label htmlFor="visitdate" className="text-ink">{t.booking.visitDate}</Label>
          <Input id="visitdate" type="date" value={visitDate} min={isoOffset(0)}
            onChange={(e) => setVisitDate(e.target.value)} />
        </div>
      )}

      <div className="mt-3 space-y-1.5">
        <Label htmlFor="guests" className="text-ink">
          {mode === "experience" ? t.booking.pax : t.booking.guests}
        </Label>
        <Input
          id="guests" type="number" min={1}
          max={mode === "stay" && homestay?.max_guests ? homestay.max_guests : undefined}
          value={guests}
          onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
        />
      </div>

      {hasExp && (
        <div className="mt-5">
          <Label className="text-ink">
            {mode === "stay" ? t.booking.addExp : t.booking.chooseExp}
          </Label>
          <div className="mt-2 space-y-2">
            {experiences.map((e) => (
              <label key={e.id}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-line px-3 py-2 text-sm">
                <span className="flex items-center gap-2.5 text-ink">
                  <Checkbox
                    checked={selectedExp.includes(e.id)}
                    onCheckedChange={(v) => toggleExp(e.id, v === true)}
                  />
                  <span>
                    {e.title}
                    {e.category && (
                      <span className="ml-1.5 rounded-full border border-line px-1.5 py-0.5 text-xs uppercase tracking-wide text-palm">
                        {e.category}
                      </span>
                    )}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-muted-foreground">
                  {rupiah(Number(e.price_per_pax))}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-ink">{t.booking.name}</Label>
          <Input id="name" value={guestName} onChange={(e) => setGuestName(e.target.value)}
            placeholder="Sarah Tan" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-ink">{t.booking.phone}</Label>
          <PhoneInput id="phone" value={guestPhone} onChange={setGuestPhone} placeholder="8123 4567" />
        </div>
      </div>

      <dl className="mt-6 space-y-1.5 border-t border-line pt-4 text-sm">
        {mode === "stay" && lodging > 0 && (
          <div className="flex justify-between text-ink/80">
            <dt>{rupiah(Number(homestay?.price_per_night))} × {t.booking.nights(nights)}</dt>
            <dd className="font-mono">{rupiah(lodging)}</dd>
          </div>
        )}
        {experiencesTotal > 0 && (
          <div className="flex justify-between text-ink/80">
            <dt>{t.booking.expXPax(guests)}</dt>
            <dd className="font-mono">{rupiah(experiencesTotal)}</dd>
          </div>
        )}
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

      <Button onClick={submit} disabled={!canBook || pending} size="lg"
        className="mt-5 w-full rounded-full bg-clay text-base text-paper hover:bg-clay/90">
        {pending ? t.booking.reserving : t.booking.reserve}
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        {t.booking.noCharge}
      </p>
    </div>
  );
}
