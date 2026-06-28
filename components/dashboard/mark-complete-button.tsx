"use client";

import { useTransition } from "react";
import { markComplete } from "@/app/(dashboard)/admin/bookings/actions";

export function MarkCompleteButton({ bookingId }: { bookingId: string }) {
  const [pending, startTransition] = useTransition();

  function handle() {
    startTransition(async () => {
      const res = await markComplete(bookingId);
      if (!res.ok) alert(res.error);
    });
  }

  return (
    <button
      onClick={handle}
      disabled={pending}
      className="rounded-full border border-line bg-secondary px-4 py-1.5 text-xs font-semibold text-ink transition-opacity disabled:opacity-50 hover:border-ink/40"
    >
      {pending ? "Updating…" : "Mark complete"}
    </button>
  );
}
