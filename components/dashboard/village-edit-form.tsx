"use client";

import { useState, useTransition } from "react";
import {
  updateVillage, saveHomestay, deleteHomestay,
  saveExperience, deleteExperience,
} from "@/app/(dashboard)/admin/villages/[id]/edit/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";

// ── Types ────────────────────────────────────────────────────────────────────

export type Homestay = {
  id: string; host_whatsapp_number: string;
  price_per_night: number; max_guests: number;
};

export type Experience = {
  id: string; title: string; description: string | null;
  category: string | null; price_per_pax: number; guide_whatsapp_number: string;
};

export type VillageData = {
  id: string; name: string; region: string | null; description: string | null;
  hero_image_url: string | null; bumdes_bank_account: string | null;
  sanitation_rating: number; homestays: Homestay[]; experiences: Experience[];
};

// ── Shared helpers ───────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-ink">{label}</Label>
      {children}
    </div>
  );
}

function SectionHead({ title }: { title: string }) {
  return (
    <h2 className="mb-4 border-b border-line pb-2 font-display text-xl font-semibold text-ink">
      {title}
    </h2>
  );
}

// ── Village info section ─────────────────────────────────────────────────────

function VillageInfoSection({ village }: { village: VillageData }) {
  const [name, setName]             = useState(village.name);
  const [region, setRegion]         = useState(village.region ?? "");
  const [description, setDesc]      = useState(village.description ?? "");
  const [heroUrl, setHeroUrl]       = useState(village.hero_image_url ?? "");
  const [bumdes, setBumdes]         = useState(village.bumdes_bank_account ?? "");
  const [rating, setRating]         = useState(String(village.sanitation_rating));
  const [msg, setMsg]               = useState<string | null>(null);
  const [ok, setOk]                 = useState<boolean | null>(null);
  const [pending, startTransition]  = useTransition();

  function save() {
    setMsg(null);
    startTransition(async () => {
      const res = await updateVillage(village.id, {
        name, region, description, heroImageUrl: heroUrl,
        bumdesBankAccount: bumdes, sanitationRating: Number(rating) || 4,
      });
      setOk(res.ok);
      setMsg(res.ok ? "Saved." : res.error);
    });
  }

  return (
    <section className="mb-10">
      <SectionHead title="Village details" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Village name *">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Desa Penglipuran" />
        </Field>
        <Field label="Region">
          <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Bangli, Bali" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description">
            <Textarea rows={3} value={description}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Tell the story of this village…" className="resize-none" />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Hero image URL">
            <Input value={heroUrl} onChange={(e) => setHeroUrl(e.target.value)}
              placeholder="https://images.unsplash.com/…" />
          </Field>
        </div>
        <Field label="BUMDes bank account">
          <Input value={bumdes} onChange={(e) => setBumdes(e.target.value)} placeholder="BRI 1234-01-000456-78-9" />
        </Field>
        <Field label="Sanitation rating (1–5)">
          <Input type="number" min={1} max={5} value={rating}
            onChange={(e) => setRating(e.target.value)} />
        </Field>
      </div>
      {msg && (
        <p className={`mt-3 text-sm ${ok ? "text-palm" : "text-clay"}`}>{msg}</p>
      )}
      <Button onClick={save} disabled={pending || !name.trim()}
        className="mt-4 rounded-full bg-ink text-paper hover:bg-palm-deep">
        {pending ? "Saving…" : "Save village details"}
      </Button>
    </section>
  );
}

// ── Homestay row ─────────────────────────────────────────────────────────────

type HomestayFormState = { hostWhatsapp: string; pricePerNight: string; maxGuests: string };

function emptyHomestay(): HomestayFormState {
  return { hostWhatsapp: "", pricePerNight: "", maxGuests: "4" };
}
function fromHomestay(h: Homestay): HomestayFormState {
  return { hostWhatsapp: h.host_whatsapp_number, pricePerNight: String(h.price_per_night), maxGuests: String(h.max_guests) };
}

function HomestayForm({
  villageId, initial, onDone, onCancel,
}: {
  villageId: string; initial: HomestayFormState; id?: string;
  onDone: () => void; onCancel: () => void;
}) {
  const [form, setForm]            = useState(initial);
  const [error, setError]          = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function field<K extends keyof HomestayFormState>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await saveHomestay(villageId, {
        hostWhatsapp: form.hostWhatsapp,
        pricePerNight: Number(form.pricePerNight),
        maxGuests: Number(form.maxGuests),
      });
      if (res.ok) onDone();
      else setError(res.error);
    });
  }

  return (
    <div className="mt-2 rounded-lg border border-line bg-secondary p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Host WhatsApp *">
          <PhoneInput value={form.hostWhatsapp} onChange={(v) => setForm((p) => ({ ...p, hostWhatsapp: v }))} placeholder="812 3456 7890" />
        </Field>
        <Field label="Price / night (IDR)">
          <Input type="number" value={form.pricePerNight} onChange={field("pricePerNight")} placeholder="350000" />
        </Field>
        <Field label="Max guests">
          <Input type="number" min={1} value={form.maxGuests} onChange={field("maxGuests")} />
        </Field>
      </div>
      {error && <p className="mt-2 text-sm text-clay">{error}</p>}
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={save} disabled={pending || !form.hostWhatsapp.trim()}
          className="rounded-full bg-palm text-paper hover:bg-palm-deep">
          {pending ? "Saving…" : "Save"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

function HomestaysSection({ villageId, initial }: { villageId: string; initial: Homestay[] }) {
  const [items, setItems]          = useState(initial);
  const [editing, setEditing]      = useState<string | "new" | null>(null);
  const [deleting, setDeleting]    = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm("Delete this homestay? Existing bookings won't be affected.")) return;
    setDeleting(id);
    startTransition(async () => {
      const res = await deleteHomestay(villageId, id);
      if (res.ok) setItems((prev) => prev.filter((h) => h.id !== id));
      else alert(res.error);
      setDeleting(null);
    });
  }

  return (
    <section className="mb-10">
      <SectionHead title="Homestays" />
      <div className="space-y-3">
        {items.map((h) => (
          <div key={h.id} className="rounded-lg border border-line bg-card p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-mono text-sm text-ink">{h.host_whatsapp_number}</p>
                <p className="text-xs text-muted-foreground">
                  Rp {Number(h.price_per_night).toLocaleString("id-ID")} / night · up to {h.max_guests} guests
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setEditing(editing === h.id ? null : h.id)}
                  className="text-xs font-medium text-palm hover:text-clay">
                  {editing === h.id ? "Cancel" : "Edit"}
                </button>
                <button onClick={() => handleDelete(h.id)}
                  disabled={deleting === h.id || pending}
                  className="text-xs font-medium text-clay/70 hover:text-clay disabled:opacity-40">
                  Delete
                </button>
              </div>
            </div>
            {editing === h.id && (
              <HomestayForm
                villageId={villageId}
                initial={fromHomestay(h)}
                onDone={() => { setEditing(null); window.location.reload(); }}
                onCancel={() => setEditing(null)}
              />
            )}
          </div>
        ))}

        {editing === "new" ? (
          <HomestayForm
            villageId={villageId}
            initial={emptyHomestay()}
            onDone={() => { setEditing(null); window.location.reload(); }}
            onCancel={() => setEditing(null)}
          />
        ) : (
          <button
            onClick={() => setEditing("new")}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line py-3 text-sm font-medium text-palm hover:border-palm"
          >
            + Add homestay
          </button>
        )}
      </div>
    </section>
  );
}

// ── Experience row ───────────────────────────────────────────────────────────

type ExperienceFormState = {
  title: string; description: string; category: string;
  pricePerPax: string; guideWhatsapp: string;
};

function emptyExperience(): ExperienceFormState {
  return { title: "", description: "", category: "", pricePerPax: "", guideWhatsapp: "" };
}
function fromExperience(e: Experience): ExperienceFormState {
  return {
    title: e.title, description: e.description ?? "", category: e.category ?? "",
    pricePerPax: String(e.price_per_pax), guideWhatsapp: e.guide_whatsapp_number,
  };
}

const CATEGORIES = ["music", "craft", "culinary", "nature", "agriculture", "ritual"];

function ExperienceForm({
  villageId, initial, onDone, onCancel,
}: {
  villageId: string; initial: ExperienceFormState;
  onDone: () => void; onCancel: () => void;
}) {
  const [form, setForm]            = useState(initial);
  const [error, setError]          = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function field<K extends keyof ExperienceFormState>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await saveExperience(villageId, {
        title: form.title,
        description: form.description,
        category: form.category,
        pricePerPax: Number(form.pricePerPax),
        guideWhatsapp: form.guideWhatsapp,
      });
      if (res.ok) onDone();
      else setError(res.error);
    });
  }

  return (
    <div className="mt-2 rounded-lg border border-line bg-secondary p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title *">
          <Input value={form.title} onChange={field("title")} placeholder="Batik tulis workshop" />
        </Field>
        <Field label="Category">
          <select value={form.category} onChange={field("category")}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
            <option value="">— select —</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description">
            <Textarea rows={2} value={form.description} onChange={field("description")}
              placeholder="What will guests do and learn?" className="resize-none" />
          </Field>
        </div>
        <Field label="Price / pax (IDR)">
          <Input type="number" value={form.pricePerPax} onChange={field("pricePerPax")} placeholder="150000" />
        </Field>
        <Field label="Guide WhatsApp *">
          <PhoneInput value={form.guideWhatsapp} onChange={(v) => setForm((p) => ({ ...p, guideWhatsapp: v }))} placeholder="812 3456 7890" />
        </Field>
      </div>
      {error && <p className="mt-2 text-sm text-clay">{error}</p>}
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={save} disabled={pending || !form.title.trim() || !form.guideWhatsapp.trim()}
          className="rounded-full bg-palm text-paper hover:bg-palm-deep">
          {pending ? "Saving…" : "Save"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

function ExperiencesSection({ villageId, initial }: { villageId: string; initial: Experience[] }) {
  const [items, setItems]          = useState(initial);
  const [editing, setEditing]      = useState<string | "new" | null>(null);
  const [deleting, setDeleting]    = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm("Delete this experience?")) return;
    setDeleting(id);
    startTransition(async () => {
      const res = await deleteExperience(villageId, id);
      if (res.ok) setItems((prev) => prev.filter((e) => e.id !== id));
      else alert(res.error);
      setDeleting(null);
    });
  }

  return (
    <section className="mb-10">
      <SectionHead title="Experiences" />
      <div className="space-y-3">
        {items.map((e) => (
          <div key={e.id} className="rounded-lg border border-line bg-card p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-ink">{e.title}</p>
                <p className="text-xs text-muted-foreground">
                  {e.category ? `${e.category} · ` : ""}
                  Rp {Number(e.price_per_pax).toLocaleString("id-ID")} / pax
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setEditing(editing === e.id ? null : e.id)}
                  className="text-xs font-medium text-palm hover:text-clay">
                  {editing === e.id ? "Cancel" : "Edit"}
                </button>
                <button onClick={() => handleDelete(e.id)}
                  disabled={deleting === e.id || pending}
                  className="text-xs font-medium text-clay/70 hover:text-clay disabled:opacity-40">
                  Delete
                </button>
              </div>
            </div>
            {editing === e.id && (
              <ExperienceForm
                villageId={villageId}
                initial={fromExperience(e)}
                onDone={() => { setEditing(null); window.location.reload(); }}
                onCancel={() => setEditing(null)}
              />
            )}
          </div>
        ))}

        {editing === "new" ? (
          <ExperienceForm
            villageId={villageId}
            initial={emptyExperience()}
            onDone={() => { setEditing(null); window.location.reload(); }}
            onCancel={() => setEditing(null)}
          />
        ) : (
          <button
            onClick={() => setEditing("new")}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line py-3 text-sm font-medium text-palm hover:border-palm"
          >
            + Add experience
          </button>
        )}
      </div>
    </section>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────

export function VillageEditForm({ village }: { village: VillageData }) {
  return (
    <div>
      <VillageInfoSection village={village} />
      <HomestaysSection villageId={village.id} initial={village.homestays} />
      <ExperiencesSection villageId={village.id} initial={village.experiences} />
    </div>
  );
}
