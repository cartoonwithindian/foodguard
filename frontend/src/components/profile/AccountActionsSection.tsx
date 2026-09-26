"use client";

import { LogOut, Trash2 } from "lucide-react";
import type { ProfileLabels } from "@/data/profile-labels";

type AccountActionsSectionProps = {
  labels: ProfileLabels["accountActions"];
  onLogout?: () => void;
  onDeleteAccount?: () => void;
};

export function AccountActionsSection({
  labels,
  onLogout,
  onDeleteAccount,
}: AccountActionsSectionProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-foreground">{labels.title}</h2>

      <div className="space-y-3">
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex w-full items-center gap-3 rounded-xl border border-border p-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-amber-100">
            <LogOut className="size-5 text-amber-700" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{labels.logout}</p>
          </div>
        </button>

        <button
          type="button"
          onClick={onDeleteAccount}
          className="inline-flex w-full items-center gap-3 rounded-xl border border-red-200 p-4 text-left transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-red-100">
            <Trash2 className="size-5 text-red-600" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-red-700">{labels.deleteAccount}</p>
            <p className="mt-0.5 text-xs text-red-600/70">{labels.deleteConfirmDescription}</p>
          </div>
        </button>
      </div>
    </div>
  );
}
