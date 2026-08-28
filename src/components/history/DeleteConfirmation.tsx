"use client";

import { AlertTriangle } from "lucide-react";
import type { HistoryLabels } from "@/data/history-labels";

type DeleteConfirmationProps = {
  labels: HistoryLabels["delete"];
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteConfirmation({
  labels,
  onConfirm,
  onCancel,
}: DeleteConfirmationProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
      onKeyDown={(e) => {
        if (e.key === "Escape") onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={labels.confirmTitle}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
            <AlertTriangle className="size-5 text-red-600" aria-hidden="true" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            {labels.confirmTitle}
          </h3>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">
          {labels.confirmDescription}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {labels.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          >
            {labels.remove}
          </button>
        </div>
      </div>
    </div>
  );
}
