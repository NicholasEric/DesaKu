/**
 * Fonnte WhatsApp transport.
 * Docs: https://fonnte.com/docs
 *
 * Fonnte API expects:
 *   target      — national number only (no country code prefix)
 *   countryCode — the country dialling code (e.g. "62", "81", "880")
 *
 * Without countryCode Fonnte defaults to "62" (Indonesia) and prepends it to
 * every number, which breaks non-Indonesian recipients.
 */

export type SendResult = {
  ok: boolean;
  fonnteStatus?: string;
  error?: string;
};

type FonnteTarget = { national: string; countryCode: string };

/**
 * Split a raw phone number into a national number and country code for Fonnte.
 *
 * Supports:
 *   "+62 812-345-6789"  → { national: "8123456789", countryCode: "62" }
 *   "0812-345-6789"     → { national: "8123456789", countryCode: "62" }
 *   "+81 80-7644-9140"  → { national: "8076449140", countryCode: "81"  }
 *   "+880 1924769118"   → { national: "1924769118", countryCode: "880" }
 *   "+65 8123 4567"     → { national: "81234567",   countryCode: "65"  }
 */
function parseFonnteTarget(raw: string): FonnteTarget {
  const digits = raw.replace(/\D/g, "");

  // Local format with leading 0 → default to Indonesian
  if (digits.startsWith("0")) {
    return { national: digits.slice(1), countryCode: "62" };
  }

  // Sorted longest-first so 3-digit codes (880, 852 …) match before
  // their 2-digit prefixes (88, 85 …).
  const CODES = [
    "880", // Bangladesh
    "852", // Hong Kong
    "853", // Macau
    "855", // Cambodia
    "856", // Laos
    "886", // Taiwan
    "960", // Maldives
    "966", // Saudi Arabia
    "971", // UAE
    "972", // Israel
    "62",  // Indonesia
    "60",  // Malaysia
    "61",  // Australia
    "63",  // Philippines
    "64",  // New Zealand
    "65",  // Singapore
    "66",  // Thailand
    "81",  // Japan
    "82",  // South Korea
    "84",  // Vietnam
    "86",  // China
    "91",  // India
    "92",  // Pakistan
    "94",  // Sri Lanka
    "95",  // Myanmar
    "44",  // UK
    "33",  // France
    "39",  // Italy
    "49",  // Germany
    "1",   // US / Canada (single digit — must be last)
  ];

  for (const cc of CODES) {
    if (digits.startsWith(cc)) {
      // Also strip a redundant leading 0 in the national part
      // (e.g. someone typed "+62 0812…" by mistake)
      const national = digits.slice(cc.length).replace(/^0/, "");
      return { national, countryCode: cc };
    }
  }

  // Fallback: treat as Indonesian local without the leading 0
  return { national: digits, countryCode: "62" };
}

export async function sendWhatsApp(
  phone: string,
  message: string,
): Promise<SendResult> {
  const token = process.env.FONNTE_TOKEN;
  if (!token) {
    return { ok: false, error: "FONNTE_TOKEN is not set." };
  }

  const { national, countryCode } = parseFonnteTarget(phone);

  if (national.length < 7) {
    return { ok: false, error: `Invalid phone number: ${phone}` };
  }

  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ target: national, message, countryCode }),
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
