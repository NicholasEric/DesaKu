import { createAdminClient } from "@/lib/supabase/admin";
import { ConfirmBookingButton } from "@/components/dashboard/confirm-booking-button";
import { MarkCompleteButton } from "@/components/dashboard/mark-complete-button";
import { rupiah, nightsBetween } from "@/lib/format";

export const metadata = { title: "Bookings · DesaKu Admin" };

const STATUS_CHIP: Record<string, string> = {
  pending: "bg-gold/20 text-gold-deep border-gold/40",
  confirmed: "bg-palm/15 text-palm border-palm/30",
  completed: "bg-secondary text-muted-foreground border-line",
  cancelled: "bg-clay/10 text-clay border-clay/30",
};

type BookingRow = {
  id: string;
  guest_name: string | null;
  guest_phone: string | null;
  check_in: string;
  check_out: string;
  total_amount: number;
  status: string;
  experience_ids: string[] | null;
  homestays: { villages: { name: string; region: string | null } | null } | null;
  distributions: {
    host_amount: number;
    guide_amount: number;
    bumdes_amount: number;
  } | null;
  whatsapp_logs: {
    id: string;
    target_phone_number: string;
    message_template: string;
    message_body: string;
    status: string;
    created_at: string;
  }[];
};

export default async function AdminBookingsPage() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `id, guest_name, guest_phone, check_in, check_out,
       total_amount, status, experience_ids,
       homestays ( villages ( name, region ) ),
       distributions ( host_amount, guide_amount, bumdes_amount ),
       whatsapp_logs ( id, target_phone_number, message_template,
                       message_body, status, created_at )`,
    )
    .order("created_at", { ascending: false });

  const bookings = (data ?? []) as unknown as BookingRow[];

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <header className="mb-10">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-clay">
          Bookings desk
        </span>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">
          All bookings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pending bookings need manual confirmation. Confirming fires the
          WhatsApp Concierge via Fonnte and logs the delivery status below.
        </p>
      </header>

      {error && (
        <p className="rounded-md border border-clay/40 bg-clay/10 px-4 py-3 text-sm text-clay">
          {error.message}
        </p>
      )}

      {!error && bookings.length === 0 && (
        <p className="text-muted-foreground">No bookings yet.</p>
      )}

      <div className="space-y-4">
        {bookings.map((b) => {
          const village = b.homestays?.villages;
          const nights = nightsBetween(b.check_in, b.check_out);
          const dist = Array.isArray(b.distributions)
            ? b.distributions[0]
            : b.distributions;
          const logs: BookingRow["whatsapp_logs"] = Array.isArray(b.whatsapp_logs)
            ? b.whatsapp_logs
            : b.whatsapp_logs
              ? [b.whatsapp_logs]
              : [];

          return (
            <details
              key={b.id}
              className="group rounded-xl border border-line bg-card"
            >
              <summary className="flex cursor-pointer list-none items-start gap-4 p-5">
                {/* Status chip */}
                <span
                  className={`mt-0.5 shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_CHIP[b.status] ?? STATUS_CHIP.pending}`}
                >
                  {b.status}
                </span>

                {/* Core info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-display text-lg font-semibold text-ink">
                      {b.guest_name ?? "Guest"}
                    </span>
                    {village && (
                      <span className="text-sm text-muted-foreground">
                        → {village.name}
                        {village.region ? `, ${village.region}` : ""}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {b.check_in} → {b.check_out} · {nights} night
                    {nights === 1 ? "" : "s"} ·{" "}
                    {b.experience_ids?.length ?? 0} experience
                    {(b.experience_ids?.length ?? 0) === 1 ? "" : "s"}
                  </p>
                </div>

                {/* Amount + action */}
                <div className="flex shrink-0 items-center gap-4">
                  <span className="font-mono text-sm text-ink">
                    {rupiah(Number(b.total_amount))}
                  </span>
                  {b.status === "pending" && (
                    <ConfirmBookingButton bookingId={b.id} />
                  )}
                  {b.status === "confirmed" && (
                    <MarkCompleteButton bookingId={b.id} />
                  )}
                  {(b.status === "completed" || b.status === "cancelled") && (
                    <span className="text-xs text-muted-foreground">
                      {logs.length} msg{logs.length === 1 ? "" : "s"} sent
                    </span>
                  )}
                </div>
              </summary>

              {/* Expanded detail */}
              <div className="border-t border-line px-5 pb-5 pt-4 text-sm">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Split */}
                  {dist && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Distribution
                      </p>
                      <div className="space-y-1.5">
                        {[
                          { label: "Host family (50%)", val: dist.host_amount, dot: "bg-palm" },
                          { label: "Guide & artisans (30%)", val: dist.guide_amount, dot: "bg-clay" },
                          { label: "Village fund (20%)", val: dist.bumdes_amount, dot: "bg-gold" },
                        ].map((r) => (
                          <div key={r.label} className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-ink/80">
                              <span className={`h-2 w-2 rounded-full ${r.dot}`} />
                              {r.label}
                            </span>
                            <span className="font-mono">{rupiah(Number(r.val))}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Guest details */}
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Guest details
                    </p>
                    <dl className="space-y-1 text-ink/80">
                      <div className="flex gap-2">
                        <dt className="text-muted-foreground">Name</dt>
                        <dd>{b.guest_name ?? "—"}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-muted-foreground">Phone</dt>
                        <dd>{b.guest_phone ?? "—"}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-muted-foreground">Booking ID</dt>
                        <dd className="font-mono text-xs break-all">{b.id}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* WhatsApp logs */}
                {logs.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      WhatsApp Concierge logs ({logs.length})
                    </p>
                    <div className="space-y-3">
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          className="rounded-lg border border-line bg-secondary p-4"
                        >
                          <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                            <span className="font-mono text-muted-foreground">
                              → {log.target_phone_number}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="rounded-sm bg-ink/10 px-1.5 py-0.5 font-mono text-muted-foreground">
                                {log.message_template}
                              </span>
                              <span className={`rounded-full px-2 py-0.5 ${
                                log.status === "sent"
                                  ? "bg-palm/15 text-palm"
                                  : "bg-clay/15 text-clay"
                              }`}>
                                {log.status}
                              </span>
                            </div>
                          </div>
                          <pre className="whitespace-pre-wrap font-sans text-sm text-ink/80">
                            {log.message_body}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
