/**
 * Fonnte WhatsApp transport.
 * Docs: https://fonnte.com/docs
 *
 * One function: sendWhatsApp(phone, message) → { ok, status }
 * Called by the confirmBooking server action for each recipient.
 * The caller writes the result into whatsapp_logs regardless of success/failure
 * so every attempt is auditable.
 */

export type SendResult = {
  ok: boolean;
  fonnteStatus?: string;
  error?: string;
};

/**
 * Normalise a phone number to the format Fonnte expects:
 * digits only, no leading +, Indonesian numbers get the 62 country code.
 * Examples:  +62 812-345-6789  →  6281234567890
 *            0812-345-6789     →  6281234567890
 *            +65 8123 4567     →  6581234567
 */
function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  return digits;
}

export async function sendWhatsApp(
  phone: string,
  message: string,
): Promise<SendResult> {
  const token = process.env.FONNTE_TOKEN;
  if (!token) {
    return { ok: false, error: "FONNTE_TOKEN is not set." };
  }

  const target = normalisePhone(phone);
  if (target.length < 8) {
    return { ok: false, error: `Invalid phone number: ${phone}` };
  }

  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ target, message }),
    });

    const json = (await res.json()) as { status: boolean; reason?: string };

    if (!json.status) {
      return { ok: false, fonnteStatus: "failed", error: json.reason ?? "Unknown Fonnte error" };
    }

    return { ok: true, fonnteStatus: "sent" };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error calling Fonnte",
    };
  }
}
