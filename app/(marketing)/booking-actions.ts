"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { calculateDistribution } from "@/lib/distribution";
import { nightsBetween } from "@/lib/format";

export type CreateBookingInput = {
  homestayId: string;
  experienceIds: string[];
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName: string;
  guestPhone: string;
};

export type CreateBookingResult =
  | { ok: true; bookingId: string }
  | { ok: false; error: string };

export async function createBooking(
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  const guestName = input.guestName?.trim();
  if (!guestName) return { ok: false, error: "Please tell us who's travelling." };
  if (!input.homestayId) return { ok: false, error: "Choose a homestay." };

  const nights = nightsBetween(input.checkIn, input.checkOut);
  if (nights < 1) {
    return { ok: false, error: "Check-out must be after check-in." };
  }

  const guests = Math.max(1, Math.floor(input.guests || 1));
  const supabase = createAdminClient();

  // Re-read the homestay price from the source of truth.
  const { data: homestay, error: hErr } = await supabase
    .from("homestays")
    .select("id, village_id, price_per_night, max_guests")
    .eq("id", input.homestayId)
    .single();

  if (hErr || !homestay) {
    return { ok: false, error: "That homestay is no longer available." };
  }
  if (homestay.max_guests && guests > homestay.max_guests) {
    return {
      ok: false,
      error: `This homestay sleeps up to ${homestay.max_guests} guests.`,
    };
  }

  // Re-read experience prices; only experiences from the same village count.
  const experienceIds = [...new Set(input.experienceIds ?? [])];
  let experiencesTotal = 0;
  if (experienceIds.length > 0) {
    const { data: experiences, error: eErr } = await supabase
      .from("experiences")
      .select("id, price_per_pax, village_id")
      .in("id", experienceIds)
      .eq("village_id", homestay.village_id);

    if (eErr) return { ok: false, error: "Could not price the experiences." };
    if ((experiences?.length ?? 0) !== experienceIds.length) {
      return { ok: false, error: "An experience doesn't belong to this village." };
    }
    experiencesTotal = (experiences ?? []).reduce(
      (sum, e) => sum + Number(e.price_per_pax) * guests,
      0,
    );
  }

  const total = Number(homestay.price_per_night) * nights + experiencesTotal;
  const split = calculateDistribution(total);

  // 1. The booking (pending until the host confirms via the concierge).
  const { data: booking, error: bErr } = await supabase
    .from("bookings")
    .insert({
      tourist_id: null,
      guest_name: guestName,
      guest_phone: input.guestPhone?.trim() || null,
      homestay_id: homestay.id,
      experience_ids: experienceIds,
      check_in: input.checkIn,
      check_out: input.checkOut,
      total_amount: total,
      status: "pending",
    })
    .select("id")
    .single();

  if (bErr || !booking) {
    return { ok: false, error: bErr?.message ?? "Could not create the booking." };
  }

  // 2. The transparent 50/30/20 split, materialised alongside it.
  const { error: dErr } = await supabase.from("distributions").insert({
    booking_id: booking.id,
    host_amount: split.host,
    guide_amount: split.guide,
    bumdes_amount: split.bumdes,
    status: "pending",
  });

  if (dErr) {
    return {
      ok: false,
      error: `Booking saved, but the split failed to record: ${dErr.message}`,
    };
  }

  return { ok: true, bookingId: booking.id };
}
