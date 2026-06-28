/**
 * Sanitation & comfort curation. A village earns a 1–5 rating from this
 * checklist; the same pure function runs on the client (live preview) and on
 * the server (the trusted value that gets stored). Never trust a rating sent
 * from the browser — always recompute from the checked criteria.
 */
export type SanitationCriterion = {
  id: string;
  label: string;
  hint: string;
};

export const SANITATION_CRITERIA: SanitationCriterion[] = [
  {
    id: "toilet",
    label: "Private flush or clean squat toilet",
    hint: "Working, private, and cleaned daily.",
  },
  {
    id: "water",
    label: "Safe drinking water on site",
    hint: "Boiled, filtered, or sealed bottled water provided.",
  },
  {
    id: "bed",
    label: "Proper bed, fresh linen, lockable door",
    hint: "A real mattress and a door the guest can lock.",
  },
  {
    id: "kitchen",
    label: "Hygienic food preparation",
    hint: "Clean kitchen, covered food, washed produce.",
  },
  {
    id: "path",
    label: "Lit, walkable path after dark",
    hint: "Guests can reach the toilet and exit safely at night.",
  },
];

/** A village must score at least this to be listed publicly. */
export const MIN_RATING_TO_LIST = 4;

/**
 * Maps the set of satisfied criteria to a 1–5 rating.
 * With five criteria this is simply "how many passed", floored at 1.
 */
export function computeSanitationRating(checkedIds: string[]): number {
  const valid = new Set(SANITATION_CRITERIA.map((c) => c.id));
  const passed = checkedIds.filter((id) => valid.has(id)).length;
  const rating = Math.round((passed / SANITATION_CRITERIA.length) * 5);
  return Math.min(5, Math.max(1, rating));
}
