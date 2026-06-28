"use client";

import { useTransition } from "react";
import { confirmBooking } from "@/app/(dashboard)/admin/bookings/actions";

export function ConfirmBookingButton({ bookingId }: { bookingId: string }) {
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const res = await confirmBooking(bookingId);
      if (!res.ok) alert(res.error);
    });
  }

  return (
    <button
      onClick={handleConfirm}
      disabled={pending}
      className="rounded-full bg-palm px-4 py-1.5 text-xs font-semibold text-paper transition-opacity disabled:opacity-50 hover:bg-palm-deep"
    >
      {pending ? "Confirming…" : "Confirm & send"}
    </button>
  );
}
