type Review = {
  id: string;
  tourist_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

function Stars({ n }: { n: number }) {
  return (
    <span className="text-sm">
      <span className="text-gold">{"★".repeat(n)}</span>
      <span className="text-line">{"★".repeat(5 - n)}</span>
    </span>
  );
}

export function ReviewList({
  reviews,
  avgRating,
  noReviewsText = "No reviews yet. Book a stay and be the first.",
}: {
  reviews: Review[];
  avgRating: number | null;
  noReviewsText?: string;
}) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {noReviewsText}
      </p>
    );
  }

  return (
    <div>
      {avgRating !== null && (
        <div className="mb-6 flex items-baseline gap-3">
          <span className="font-display text-4xl font-bold text-ink">
            {avgRating.toFixed(1)}
          </span>
          <Stars n={Math.round(avgRating)} />
          <span className="text-sm text-muted-foreground">
            {reviews.length} review{reviews.length === 1 ? "" : "s"}
          </span>
        </div>
      )}
      <ul className="space-y-5">
        {reviews.map((r) => (
          <li key={r.id} className="border-b border-line pb-5 last:border-0">
            <div className="flex items-center justify-between">
              <span className="font-medium text-ink">{r.tourist_name}</span>
              <Stars n={r.rating} />
            </div>
            {r.comment && (
              <p className="mt-2 text-sm leading-relaxed text-ink/75">
                {r.comment}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(r.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
