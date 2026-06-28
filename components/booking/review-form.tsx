"use client";

import { useState, useTransition } from "react";
import { submitReview } from "@/app/(marketing)/bookings/review-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/components/lang-provider";

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const t = useT();
  const [rating, setRating]       = useState(0);
  const [hovered, setHovered]     = useState(0);
  const [comment, setComment]     = useState("");
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [pending, startTransition]= useTransition();

  function submit() {
    if (rating === 0) { setError(t.review.noStars); return; }
    setError(null);
    startTransition(async () => {
      const res = await submitReview(bookingId, rating, comment);
      if (res.ok) setDone(true);
      else setError(res.error);
    });
  }

  if (done) {
    return (
      <div className="rounded-xl border border-palm/30 bg-palm/5 p-6">
        <p className="font-display text-xl font-semibold text-palm">
          {t.review.thankYou}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.review.thankYouNote}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-card p-6">
      <h3 className="font-display text-xl font-semibold text-ink">
        {t.review.leave}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {t.review.question}
      </p>

      <div
        className="mt-4 flex gap-1"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            className="text-3xl leading-none transition-transform hover:scale-110"
            aria-label={`${star} stars`}
          >
            <span className={star <= (hovered || rating) ? "text-gold" : "text-line"}>
              ★
            </span>
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 self-center text-sm text-muted-foreground">
            {t.review.stars[rating]}
          </span>
        )}
      </div>

      <div className="mt-4">
        <Textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t.review.placeholder}
          className="resize-none"
        />
      </div>

      {error && <p className="mt-2 text-sm text-clay">{error}</p>}

      <Button
        onClick={submit}
        disabled={pending}
        className="mt-4 rounded-full bg-palm text-paper hover:bg-palm-deep"
      >
        {pending ? t.review.submitting : t.review.submit}
      </Button>
    </div>
  );
}
