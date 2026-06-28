"use client";

import { useState, useTransition } from "react";
import {
  onboardVillage,
  type OnboardResult,
} from "@/app/(dashboard)/admin/actions";
import {
  SANITATION_CRITERIA,
  MIN_RATING_TO_LIST,
  computeSanitationRating,
} from "@/lib/sanitation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PhoneInput } from "@/components/ui/phone-input";

const AMENITIES = [
  { id: "private_bathroom", label: "Private bathroom" },
  { id: "hot_water", label: "Hot water" },
  { id: "breakfast", label: "Breakfast included" },
  { id: "fan", label: "Fan" },
  { id: "air_con", label: "Air conditioning" },
  { id: "wifi", label: "Wi-Fi" },
];

type HomestayRow = {
  hostWhatsapp: string;
  pricePerNight: string;
  maxGuests: string;
  amenities: string[];
};

const emptyHomestay = (): HomestayRow => ({
  hostWhatsapp: "",
  pricePerNight: "",
  maxGuests: "2",
  amenities: [],
});

function SectionTitle({ index, title, sub }: { index: string; title: string; sub: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-mono text-sm text-clay">{index}</span>
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

export function VillageOnboardingForm() {
  const [village, setVillage] = useState({
    name: "",
    region: "",
    bumdesBankAccount: "",
    description: "",
    heroImageUrl: "",
  });
  const [checked, setChecked] = useState<string[]>([]);
  const [homestays, setHomestays] = useState<HomestayRow[]>([emptyHomestay()]);
  const [result, setResult] = useState<OnboardResult | null>(null);
  const [pending, startTransition] = useTransition();

  const rating = computeSanitationRating(checked);
  const qualifies = rating >= MIN_RATING_TO_LIST;

  function toggleCriterion(id: string, on: boolean) {
    setChecked((prev) => (on ? [...new Set([...prev, id])] : prev.filter((x) => x !== id)));
  }

  function updateHomestay(i: number, patch: Partial<HomestayRow>) {
    setHomestays((prev) => prev.map((h, idx) => (idx === i ? { ...h, ...patch } : h)));
  }

  function toggleAmenity(i: number, amenityId: string, on: boolean) {
    setHomestays((prev) =>
      prev.map((h, idx) =>
        idx === i
          ? {
              ...h,
              amenities: on
                ? [...new Set([...h.amenities, amenityId])]
                : h.amenities.filter((a) => a !== amenityId),
            }
          : h,
      ),
    );
  }

  function reset() {
    setVillage({ name: "", region: "", bumdesBankAccount: "", description: "", heroImageUrl: "" });
    setChecked([]);
    setHomestays([emptyHomestay()]);
    setResult(null);
  }

  function submit() {
    setResult(null);
    startTransition(async () => {
      const res = await onboardVillage({
        village,
        checklist: checked,
        homestays: homestays.map((h) => ({
          hostWhatsapp: h.hostWhatsapp,
          pricePerNight: Number(h.pricePerNight),
          maxGuests: Number(h.maxGuests),
          amenities: h.amenities,
        })),
      });
      setResult(res);
      if (res.ok) window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (result?.ok) {
    return (
      <div className="rounded-xl border border-palm/30 bg-card p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-palm">
          Onboarded
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">
          {village.name || "Village"} is in.
        </h2>
        <p className="mt-2 text-ink/70">
          Saved with {result.homestays} homestay{result.homestays === 1 ? "" : "s"} and a
          sanitation rating of <strong>{result.rating}/5</strong>.{" "}
          {result.rating >= MIN_RATING_TO_LIST
            ? "It meets the listing bar and can go live."
            : `It is below the ${MIN_RATING_TO_LIST}/5 bar — kept as a draft until it improves.`}
        </p>
        <p className="mt-1 font-mono text-xs text-muted-foreground">id: {result.villageId}</p>
        <Button onClick={reset} className="mt-8 rounded-full bg-palm text-paper hover:bg-palm-deep">
          Onboard another village
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-14">
      {result && !result.ok && (
        <p className="rounded-md border border-clay/40 bg-clay/10 px-4 py-3 text-sm text-clay">
          {result.error}
        </p>
      )}

      {/* 01 — Village */}
      <section className="space-y-6">
        <SectionTitle index="01" title="The village" sub="Where guests will stay." />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Village name" required>
            <Input
              value={village.name}
              onChange={(e) => setVillage({ ...village, name: e.target.value })}
              placeholder="Desa Penglipuran"
            />
          </Field>
          <Field label="Region">
            <Input
              value={village.region}
              onChange={(e) => setVillage({ ...village, region: e.target.value })}
              placeholder="Bangli, Bali"
            />
          </Field>
          <Field label="BUMDes bank account" hint="Where the 20% village share is paid.">
            <Input
              value={village.bumdesBankAccount}
              onChange={(e) => setVillage({ ...village, bumdesBankAccount: e.target.value })}
              placeholder="BRI · 0123-0145-6789"
            />
          </Field>
          <Field label="Hero image URL">
            <Input
              value={village.heroImageUrl}
              onChange={(e) => setVillage({ ...village, heroImageUrl: e.target.value })}
              placeholder="https://…"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <Textarea
                rows={3}
                value={village.description}
                onChange={(e) => setVillage({ ...village, description: e.target.value })}
                placeholder="Bamboo-walled lanes, terraced coffee gardens, gamelan most evenings…"
              />
            </Field>
          </div>
        </div>
      </section>

      {/* 02 — Sanitation checklist */}
      <section className="space-y-6">
        <SectionTitle
          index="02"
          title="Sanitation & comfort check"
          sub="Tick what the village genuinely passes. The rating is computed from this."
        />
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
          <ul className="space-y-3">
            {SANITATION_CRITERIA.map((c) => {
              const on = checked.includes(c.id);
              return (
                <li
                  key={c.id}
                  className="flex items-start gap-3 rounded-md border border-line bg-card px-4 py-3"
                >
                  <Checkbox
                    id={`crit-${c.id}`}
                    checked={on}
                    onCheckedChange={(v) => toggleCriterion(c.id, v === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor={`crit-${c.id}`} className="cursor-pointer">
                    <span className="block font-medium text-ink">{c.label}</span>
                    <span className="block text-sm text-muted-foreground">{c.hint}</span>
                  </label>
                </li>
              );
            })}
          </ul>

          {/* Live rating dial */}
          <div
            className={`flex w-full flex-col items-center justify-center rounded-xl p-8 text-center lg:w-56 ${
              qualifies ? "bg-palm text-paper" : "bg-secondary text-ink"
            }`}
          >
            <span className="font-display text-6xl font-bold leading-none">{rating}</span>
            <span className="text-sm opacity-70">out of 5</span>
            <span className="mt-3 text-lg" aria-hidden>
              {"★".repeat(rating)}
              <span className="opacity-30">{"★".repeat(5 - rating)}</span>
            </span>
            <span className={`mt-4 text-xs font-semibold uppercase tracking-wide ${qualifies ? "text-gold" : "text-clay"}`}>
              {qualifies ? "Meets the bar" : `Needs ${MIN_RATING_TO_LIST}/5 to list`}
            </span>
          </div>
        </div>
      </section>

      {/* 03 — Homestays */}
      <section className="space-y-6">
        <SectionTitle
          index="03"
          title="Homestays"
          sub="Add each family hosting in this village. They receive the 50% share."
        />
        <div className="space-y-5">
          {homestays.map((h, i) => (
            <div key={i} className="rounded-xl border border-line bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-display text-lg font-semibold text-ink">
                  Homestay {i + 1}
                </span>
                {homestays.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setHomestays((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-sm text-muted-foreground hover:text-clay"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Host WhatsApp" hint="The concierge target.">
                  <PhoneInput
                    value={h.hostWhatsapp}
                    onChange={(v) => updateHomestay(i, { hostWhatsapp: v })}
                    placeholder="812 3456 7890"
                  />
                </Field>
                <Field label="Price / night (Rp)">
                  <Input
                    type="number"
                    min={0}
                    value={h.pricePerNight}
                    onChange={(e) => updateHomestay(i, { pricePerNight: e.target.value })}
                    placeholder="285000"
                  />
                </Field>
                <Field label="Max guests">
                  <Input
                    type="number"
                    min={1}
                    value={h.maxGuests}
                    onChange={(e) => updateHomestay(i, { maxGuests: e.target.value })}
                  />
                </Field>
              </div>

              <div className="mt-5">
                <span className="text-sm font-medium text-ink">Amenities</span>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                  {AMENITIES.map((a) => (
                    <label key={a.id} className="flex cursor-pointer items-center gap-2 text-sm text-ink/80">
                      <Checkbox
                        checked={h.amenities.includes(a.id)}
                        onCheckedChange={(v) => toggleAmenity(i, a.id, v === true)}
                      />
                      {a.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setHomestays((prev) => [...prev, emptyHomestay()])}
            className="w-full rounded-xl border border-dashed border-line py-4 text-sm font-medium text-palm transition-colors hover:border-palm hover:bg-palm/5"
          >
            + Add another homestay
          </button>
        </div>
      </section>

      {/* Submit */}
      <div className="flex items-center gap-4 border-t border-line pt-8">
        <Button
          onClick={submit}
          disabled={pending || !village.name.trim()}
          size="lg"
          className="rounded-full bg-clay px-8 text-base text-paper hover:bg-clay/90"
        >
          {pending ? "Saving…" : "Onboard village"}
        </Button>
        <span className="text-sm text-muted-foreground">
          Rating <strong className="text-ink">{rating}/5</strong> ·{" "}
          {homestays.filter((h) => h.hostWhatsapp.trim()).length} homestay(s) ready
        </span>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-ink">
        {label}
        {required && <span className="text-clay"> *</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
