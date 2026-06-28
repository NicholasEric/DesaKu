"use client";

import { useActionState } from "react";
import { unlockAdmin, type UnlockState } from "@/app/(dashboard)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminGate() {
  const [state, action, pending] = useActionState<UnlockState, FormData>(
    unlockAdmin,
    null,
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-5">
      <div className="w-full max-w-sm">
        <span className="font-display text-3xl font-bold tracking-[-0.04em] text-paper">
          Desa<span className="text-gold">Ku</span>
        </span>
        <p className="mt-1 text-sm uppercase tracking-[0.25em] text-paper/50">
          Curation desk
        </p>

        <form action={action} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="passcode" className="text-paper/80">
              Admin passcode
            </Label>
            <Input
              id="passcode"
              name="passcode"
              type="password"
              autoFocus
              autoComplete="off"
              placeholder="••••••••"
              className="border-paper/20 bg-paper/5 text-paper placeholder:text-paper/30"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-gold">{state.error}</p>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-gold text-palm-deep hover:bg-gold/90"
          >
            {pending ? "Checking…" : "Unlock"}
          </Button>
        </form>

        <p className="mt-6 text-xs leading-relaxed text-paper/40">
          MVP gate. Replaced by role-based Supabase Auth before launch.
        </p>
      </div>
    </div>
  );
}
