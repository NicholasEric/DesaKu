/**
 * The DesaKu revenue split — the heart of the platform.
 *   50% → host family
 *   30% → guide / artisan
 *   20% → village communal fund (BUMDes)
 *
 * This function is the single source of truth. It runs on the client for the
 * live preview AND on the server before a booking is written, so the stored
 * distribution can never disagree with what the traveller was shown.
 */
export const REVENUE_SPLIT = {
  host: 0.5,
  guide: 0.3,
  bumdes: 0.2,
} as const;

export type Distribution = {
  host: number;
  guide: number;
  bumdes: number;
};

export function calculateDistribution(totalAmount: number): Distribution {
  if (!Number.isFinite(totalAmount) || totalAmount < 0) {
    throw new Error("totalAmount must be a non-negative number");
  }

  // Rupiah has no sub-unit; work in whole rupiah.
  const total = Math.round(totalAmount);
  const host = Math.round(total * REVENUE_SPLIT.host);
  const guide = Math.round(total * REVENUE_SPLIT.guide);
  // BUMDes takes the remainder so the three shares always reconstruct the
  // total exactly, even when rounding nudges a share by 1 rupiah.
  const bumdes = total - host - guide;

  if (host + guide + bumdes !== total) {
    throw new Error("distribution does not sum to total");
  }

  return { host, guide, bumdes };
}
