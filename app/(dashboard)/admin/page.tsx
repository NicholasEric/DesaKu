import { VillageOnboardingForm } from "@/components/dashboard/village-onboarding-form";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <header className="mb-12">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-clay">
          Village onboarding
        </span>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink">
          Add a village to DesaKu.
        </h1>
        <p className="mt-3 max-w-xl text-ink/70">
          Capture the village, run the sanitation check, and register the host
          families. Nothing goes live below a {""}
          <span className="font-semibold text-ink">4/5</span> rating.
        </p>
      </header>

      <VillageOnboardingForm />
    </div>
  );
}
