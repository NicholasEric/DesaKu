/**
 * WhatsApp Concierge — message templates.
 *
 * MVP: we never call the WhatsApp API. Instead we generate the full message
 * payload and insert it into `whatsapp_logs` so the flow is auditable
 * end-to-end. A real integration (Twilio / Wati / official Cloud API) would
 * replace `logWhatsAppMessages` in the server action with an actual HTTP call
 * and still write the same log row for the audit trail.
 */

export type WhatsAppPayload = {
  target_phone_number: string;
  message_template: string;
  message_body: string;
};

export type BookingContext = {
  guestName: string;
  guestPhone: string | null;
  checkIn: string;
  checkOut: string;
  villageName: string;
  nights: number;
};

export type HostContext = BookingContext & {
  hostWhatsapp: string;
};

export type GuideContext = BookingContext & {
  guideWhatsapp: string;
  experienceTitle: string;
};

/** Host arrival notification — sent in Bahasa Indonesia. */
export function buildHostMessage(ctx: HostContext): WhatsAppPayload {
  return {
    target_phone_number: ctx.hostWhatsapp,
    message_template: "host_arrival",
    message_body: `Halo! Ada pemesanan baru melalui DesaKu 🌿

Tamu: ${ctx.guestName}${ctx.guestPhone ? `\nKontak tamu: ${ctx.guestPhone}` : ""}
Desa: ${ctx.villageName}
Tiba: ${formatDate(ctx.checkIn)}
Pulang: ${formatDate(ctx.checkOut)} (${ctx.nights} malam)

Mohon siapkan kamar dan sambut tamu dengan hangat.
Terima kasih banyak 🙏

— DesaKu Concierge`,
  };
}

/** Guide / artisan notification — one message per booked experience. */
export function buildGuideMessage(ctx: GuideContext): WhatsAppPayload {
  return {
    target_phone_number: ctx.guideWhatsapp,
    message_template: "guide_arrival",
    message_body: `Halo! Ada tamu DesaKu yang memesan sesi Anda 🎨

Pengalaman: ${ctx.experienceTitle}
Tamu: ${ctx.guestName}${ctx.guestPhone ? `\nKontak tamu: ${ctx.guestPhone}` : ""}
Desa: ${ctx.villageName}
Tanggal: ${formatDate(ctx.checkIn)}

Mohon siapkan sesi terbaik untuk tamu.
Terima kasih 🙏

— DesaKu Concierge`,
  };
}

function formatDate(iso: string): string {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
