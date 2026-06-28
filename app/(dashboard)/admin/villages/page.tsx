import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "Villages · DesaKu Admin" };

export default async function AdminVillagesPage() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("villages")
    .select("id, name, region, sanitation_rating, homestays(id), experiences(id)")
    .order("created_at", { ascending: false });

  type VillageListRow = {
    id: string; name: string; region: string | null; sanitation_rating: number | null;
    homestays: { id: string }[]; experiences: { id: string }[];
  };
  const villages = (data ?? []) as unknown as VillageListRow[];

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <header className="mb-10 flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-clay">
            Village registry
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">
            All villages
          </h1>
        </div>
        <Link
          href="/admin"
          className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:border-ink/40"
        >
          + Onboard new
        </Link>
      </header>

      {error && (
        <p className="rounded-md border border-clay/40 bg-clay/10 px-4 py-3 text-sm text-clay">
          {error.message}
        </p>
      )}

      {!error && villages.length === 0 && (
        <p className="text-muted-foreground">No villages yet.</p>
      )}

      <div className="space-y-3">
        {villages.map((v) => (
          <div
            key={v.id}
            className="flex items-center gap-4 rounded-xl border border-line bg-card p-5"
          >
            <div className="flex-1 min-w-0">
              <p className="font-display text-lg font-semibold text-ink">{v.name}</p>
              {v.region && (
                <p className="text-sm text-muted-foreground">{v.region}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {v.homestays.length} homestay{v.homestays.length === 1 ? "" : "s"} ·{" "}
                {v.experiences.length} experience{v.experiences.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-xs font-semibold text-palm-deep">
                ★ {v.sanitation_rating ?? "—"}/5
              </span>
              <Link
                href={`/admin/villages/${v.id}/edit`}
                className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-paper hover:bg-palm-deep"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
