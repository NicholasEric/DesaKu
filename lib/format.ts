/** Whole-rupiah formatter, e.g. 285000 → "Rp 285.000". */
export function rupiah(n: number): string {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

/** Inclusive night count between two ISO dates (check-out − check-in). */
export function nightsBetween(checkIn: string, checkOut: string): number {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}
