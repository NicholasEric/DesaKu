import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { VillageEditForm, type VillageData } from "@/components/dashboard/village-edit-form";

export const metadata = { title: "Edit Village · DesaKu Admin" };

type Params = { params: Promise<{ id: string }> };

export default async function VillageEditPage({ params }: Params) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("villages")
    .select(
      "id, name, region, description, hero_image_url, bumdes_bank_account, sanitation_rating, " +
        "homestays(id, host_whatsapp_number, price_per_night, max_guests), " +
        "experiences(id, title, description, category, price_per_pax, guide_whatsapp_number)",
    )
    .eq("id", id)
    .single();

  if (!data) notFound();

  const village = data as unknown as VillageData;

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <div className="mb-10 flex items-start gap-4">
        <div className="flex-1">
          <Link href="/admin/villages"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-clay hover:underline">
            ← Villages
          </Link>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">
            Edit: {village.name}
          </h1>
          {village.region && (
            <p className="mt-1 text-sm text-muted-foreground">{village.region}</p>
          )}
        </div>
        <Link
          href={`/villages/${id}`}
          target="_blank"
          className="shrink-0 rounded-full border border-line px-4 py-2 text-xs font-medium text-ink hover:border-ink/40"
        >
          View public page ↗
        </Link>
      </div>

      <VillageEditForm village={village} />
    </div>
  );
}
