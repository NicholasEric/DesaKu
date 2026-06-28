"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthed } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { nightsBetween } from "@/lib/format";
import {
  buildHostMessage,
  buildGuideMessage,
  buildGuestMessage,
  type WhatsAppPayload,
} from "@/lib/whatsapp";
import { sendWhatsApp } from "@/lib/fonnte";

export type ConfirmResult =
  | { ok: true; logsWritten: number }
  | { ok: false; error: string };

/**
 * Confirms a booking and fires the WhatsApp Concierge via Fonnte.
 * Each message is sent, then logged to whatsapp_logs with the real delivery
 * status ('sent' or 'failed'). The booking is marked confirmed regardless of
 * individual message delivery so a send failure never blocks the booking.
 */
export async function confirmBooking(bookingId: string): Promise<ConfirmResult> {
  if (!(await isAdminAuthed())) {
    return { ok: false, error: "Session expired. Unlock the admin again." };
  }

  const supabase = createAdminClient();

  // Fetch everything we need to build the messages.
  const { data, error: fetchErr } = await supabase
    .from("bookings")
    .select(
      `id, status, guest_name, guest_phone, check_in, check_out,
       homestays (
         id, host_whatsapp_number,
         villages ( name )
       ),
       experience_ids`,
    )
    .eq("id", bookingId)
    .single();

  if (fetchErr || !data) {
    return { ok: false, error: fetchErr?.message ?? "Booking not found." };
  }

  if (data.status === "confirmed") {
    return { ok: false, error: "This booking is already confirmed." };
  }

  const booking = data as unknown as BookingFull;
  const homestay = booking.homestays;
  const village = homestay?.villages;

  // Get village name — for experience-only bookings, look it up via first experience.
  let villageName = village?.name;
  const expIds: string[] = booking.experience_ids ?? [];
  if (!villageName && expIds.length > 0) {
    const { data: firstExp } = await supabase
      .from("experiences")
      .select("villages(name)")
      .eq("id", expIds[0])
      .single();
    villageName = (firstExp as unknown as { villages: { name: string } | null })?.villages?.name;
  }
  villageName = villageName ?? "DesaKu";

  const ctx = {
    guestName: booking.guest_name ?? "Tamu",
    guestPhone: booking.guest_phone,
    checkIn: booking.check_in,
    checkOut: booking.check_out,
    villageName,
    nights: nightsBetween(booking.check_in, booking.check_out),
  };

  const payloads: WhatsAppPayload[] = [];

  // Host message only when there is a homestay.
  if (homestay) {
    payloads.push(buildHostMessage({ ...ctx, hostWhatsapp: homestay.host_whatsapp_number }));
  }

  // Guest confirmation — only if they provided a phone number.
  if (booking.guest_phone) {
    payloads.push(
      buildGuestMessage({
        ...ctx,
        guestPhone: booking.guest_phone,
        bookingId: bookingId,
      }),
    );
  }

  // One guide message per booked experience.
  // expIds was declared above for the village name lookup.
  if (expIds.length > 0) {
    const { data: experiences } = await supabase
      .from("experiences")
      .select("id, title, guide_whatsapp_number")
      .in("id", expIds);

    for (const exp of experiences ?? []) {
      if (exp.guide_whatsapp_number) {
        payloads.push(
          buildGuideMessage({
            ...ctx,
            guideWhatsapp: exp.guide_whatsapp_number,
            experienceTitle: exp.title,
          }),
        );
      }
    }
  }

  // 1. Mark the booking confirmed.
  const { error: updateErr } = await supabase
    .from("bookings")
    .update({ status: "confirmed" })
    .eq("id", bookingId);

  if (updateErr) {
    return { ok: false, error: updateErr.message };
  }

  // 2. Send each message via Fonnte and collect results.
  const sendResults = await Promise.all(
    payloads.map((p) => sendWhatsApp(p.target_phone_number, p.message_body)),
  );

  // 3. Log every attempt with the real delivery status.
  const logRows = payloads.map((p, i) => ({
    booking_id: bookingId,
    ...p,
    status: (sendResults[i].ok ? "sent" : "failed") as "sent" | "failed",
  }));

  const { error: logErr } = await supabase.from("whatsapp_logs").insert(logRows);
  if (logErr) {
    return {
      ok: false,
      error: `Booking confirmed, but WhatsApp logs failed: ${logErr.message}`,
    };
  }

  revalidatePath("/admin/bookings");
  return { ok: true, logsWritten: logRows.length };
}

// ---------------------------------------------------------------------------
// markComplete — flips a confirmed booking to 'completed' so reviews unlock
// ---------------------------------------------------------------------------

export type MarkCompleteResult = { ok: true } | { ok: false; error: string };

export async function markComplete(bookingId: string): Promise<MarkCompleteResult> {
  if (!(await isAdminAuthed())) {
    return { ok: false, error: "Session expired. Unlock the admin again." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("bookings")
    .update({ status: "completed" })
    .eq("id", bookingId)
    .in("status", ["confirmed"]); // only confirmed bookings can be marked complete

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/bookings");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Local types (no generated DB types yet)
// ---------------------------------------------------------------------------
type BookingFull = {
  id: string;
  status: string;
  guest_name: string | null;
  guest_phone: string | null;
  check_in: string;
  check_out: string;
  experience_ids: string[] | null;
  homestays: {
    id: string;
    host_whatsapp_number: string;
    villages: { name: string } | null;
  } | null;
};
