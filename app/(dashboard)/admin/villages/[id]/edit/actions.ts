"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthed } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

async function guard() {
  if (!(await isAdminAuthed()))
    throw new Error("Session expired. Unlock the admin again.");
}

function revalidate(villageId: string) {
  revalidatePath(`/admin/villages/${villageId}/edit`);
  revalidatePath("/admin/villages");
  revalidatePath("/villages");
  revalidatePath(`/villages/${villageId}`);
}

// ── Village ─────────────────────────────────────────────────────────────────

export type VillageUpdateResult = { ok: true } | { ok: false; error: string };

export async function updateVillage(
  villageId: string,
  data: {
    name: string; region: string; description: string;
    heroImageUrl: string; bumdesBankAccount: string; sanitationRating: number;
  },
): Promise<VillageUpdateResult> {
  try { await guard(); } catch (e) { return { ok: false, error: String(e) }; }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("villages")
    .update({
      name: data.name.trim(),
      region: data.region.trim() || null,
      description: data.description.trim() || null,
      hero_image_url: data.heroImageUrl.trim() || null,
      bumdes_bank_account: data.bumdesBankAccount.trim() || null,
      sanitation_rating: Math.min(5, Math.max(1, data.sanitationRating)),
    })
    .eq("id", villageId);

  if (error) return { ok: false, error: error.message };
  revalidate(villageId);
  return { ok: true };
}

// ── Homestays ────────────────────────────────────────────────────────────────

export type HomestayUpsertResult = { ok: true; id: string } | { ok: false; error: string };

export async function saveHomestay(
  villageId: string,
  data: {
    id?: string; hostWhatsapp: string;
    pricePerNight: number; maxGuests: number;
  },
): Promise<HomestayUpsertResult> {
  try { await guard(); } catch (e) { return { ok: false, error: String(e) }; }

  const supabase = createAdminClient();
  const row = {
    village_id: villageId,
    host_whatsapp_number: data.hostWhatsapp.trim(),
    price_per_night: Number(data.pricePerNight) || 0,
    max_guests: Math.max(1, Number(data.maxGuests) || 1),
  };

  let id = data.id ?? "";
  if (data.id) {
    const { error } = await supabase.from("homestays").update(row).eq("id", data.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data: ins, error } = await supabase
      .from("homestays").insert(row).select("id").single();
    if (error || !ins) return { ok: false, error: error?.message ?? "Insert failed." };
    id = ins.id;
  }

  revalidate(villageId);
  return { ok: true, id };
}

export type DeleteResult = { ok: true } | { ok: false; error: string };

export async function deleteHomestay(
  villageId: string,
  homestayId: string,
): Promise<DeleteResult> {
  try { await guard(); } catch (e) { return { ok: false, error: String(e) }; }

  const supabase = createAdminClient();
  const { error } = await supabase.from("homestays").delete().eq("id", homestayId);
  if (error) return { ok: false, error: error.message };
  revalidate(villageId);
  return { ok: true };
}

// ── Experiences ──────────────────────────────────────────────────────────────

export type ExperienceUpsertResult = { ok: true; id: string } | { ok: false; error: string };

export async function saveExperience(
  villageId: string,
  data: {
    id?: string; title: string; description: string;
    category: string; pricePerPax: number; guideWhatsapp: string;
  },
): Promise<ExperienceUpsertResult> {
  try { await guard(); } catch (e) { return { ok: false, error: String(e) }; }

  const supabase = createAdminClient();
  const row = {
    village_id: villageId,
    title: data.title.trim(),
    description: data.description.trim() || null,
    category: data.category.trim() || null,
    price_per_pax: Number(data.pricePerPax) || 0,
    guide_whatsapp_number: data.guideWhatsapp.trim(),
  };

  let id = data.id ?? "";
  if (data.id) {
    const { error } = await supabase.from("experiences").update(row).eq("id", data.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data: ins, error } = await supabase
      .from("experiences").insert(row).select("id").single();
    if (error || !ins) return { ok: false, error: error?.message ?? "Insert failed." };
    id = ins.id;
  }

  revalidate(villageId);
  return { ok: true, id };
}

export async function deleteExperience(
  villageId: string,
  experienceId: string,
): Promise<DeleteResult> {
  try { await guard(); } catch (e) { return { ok: false, error: String(e) }; }

  const supabase = createAdminClient();
  const { error } = await supabase.from("experiences").delete().eq("id", experienceId);
  if (error) return { ok: false, error: error.message };
  revalidate(villageId);
  return { ok: true };
}
