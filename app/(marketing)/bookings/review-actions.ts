"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export type ReviewResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitReview(
  bookingId: string,
  rating: number,
  comment: string,
): Promise<ReviewResult> {
  if (!bookingId) return { ok: false, error: "Invalid booking." };
  if (rating < 1 || rating > 5) return { ok: false, error: "Rating must be 1–5." };

  const supabase = createAdminClient();

  // Fetch booking to get the names and linked items for the review.
  const { data: booking, error: bErr } = await supabase
    .from("bookings")
    .select("id, guest_name, status, booking_type, homestay_id, experience_ids")
    .eq("id", bookingId)
    .single();

  if (bErr || !booking) return { ok: false, error: "Booking not found." };
  if (!["confirmed", "completed"].includes(booking.status)) {
    return { ok: false, error: "You can only review confirmed or completed bookings." };
  }

  // Prevent duplicate reviews.
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", bookingId)
    .single();

  if (existing) return { ok: false, error: "You've already reviewed this booking." };

  // For bundles / stays → review the homestay.
  // For experience-only → review the first experience.
  const homestayId =
    booking.booking_type !== "experience" ? (booking.homestay_id ?? null) : null;

  const experienceId =
    booking.booking_type === "experience"
      ? ((booking.experience_ids as string[] | null)?.[0] ?? null)
      : null;

  const { error: rErr } = await supabase.from("reviews").insert({
    booking_id: bookingId,
    tourist_name: booking.guest_name ?? "Anonymous",
    homestay_id: homestayId,
    experience_id: experienceId,
    rating,
    comment: comment.trim() || null,
  });

  if (rErr) return { ok: false, error: rErr.message };

  revalidatePath(`/bookings/${bookingId}`);
  if (homestayId) revalidatePath(`/villages/${booking.homestay_id}`);

  return { ok: true };
}
