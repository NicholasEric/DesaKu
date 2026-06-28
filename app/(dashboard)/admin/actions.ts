"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthed } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeSanitationRating } from "@/lib/sanitation";

export type HomestayInput = {
  hostWhatsapp: string;
  pricePerNight: number;
  maxGuests: number;
  amenities: string[];
};

export type OnboardInput = {
  village: {
    name: string;
    region: string;
    bumdesBankAccount: string;
    description: string;
    heroImageUrl: string;
  };
  checklist: string[];
  homestays: HomestayInput[];
};

export type OnboardResult =
  | { ok: true; villageId: string; rating: number; homestays: number }
  | { ok: false; error: string };

export async function onboardVillage(
  input: OnboardInput,
): Promise<OnboardResult> {
  // Defense in depth: Server Actions are reachable by direct POST, so we
  // re-check the gate here even though the page is already protected.
  if (!(await isAdminAuthed())) {
    return { ok: false, error: "Your session expired. Unlock the admin again." };
  }

  const name = input.village?.name?.trim();
  if (!name) {
    return { ok: false, error: "Village name is required." };
  }

  // The rating is always recomputed server-side from the checked criteria.
  const rating = computeSanitationRating(input.checklist ?? []);

  const supabase = createAdminClient();

  const { data: village, error: villageError } = await supabase
    .from("villages")
    .insert({
      name,
      region: input.village.region?.trim() || null,
      bumdes_bank_account: input.village.bumdesBankAccount?.trim() || null,
      sanitation_rating: rating,
      description: input.village.description?.trim() || null,
      hero_image_url: input.village.heroImageUrl?.trim() || null,
    })
    .select("id")
    .single();

  if (villageError || !village) {
    return {
      ok: false,
      error: villageError?.message ?? "Could not create the village.",
    };
  }

  // Only homestays with a WhatsApp number are valid (it's the concierge target).
  const rows = (input.homestays ?? [])
    .filter((h) => h.hostWhatsapp?.trim())
    .map((h) => ({
      village_id: village.id,
      host_whatsapp_number: h.hostWhatsapp.trim(),
      price_per_night: Number(h.pricePerNight) || 0,
      max_guests: Math.max(1, Number(h.maxGuests) || 1),
      amenities: Object.fromEntries((h.amenities ?? []).map((a) => [a, true])),
    }));

  if (rows.length > 0) {
    const { error: homestayError } = await supabase
      .from("homestays")
      .insert(rows);

    if (homestayError) {
      return {
        ok: false,
        error: `Village "${name}" was saved, but its homestays failed: ${homestayError.message}`,
      };
    }
  }

  revalidatePath("/admin");
  revalidatePath("/villages");
  return { ok: true, villageId: village.id, rating, homestays: rows.length };
}
