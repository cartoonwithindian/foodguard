"use client";

import { ScanLine } from "lucide-react";
import type { HistoryLabels } from "@/data/history-labels";

type EmptyHistoryStateProps = {
  labels: HistoryLabels["empty"];
  isFiltered?: boolean;
  filteredLabels?: HistoryLabels["emptyFiltered"];
  onScan?: () => void;
};

export function EmptyHistoryState({
  labels,
  isFiltered = false,
  filteredLabels,
  onScan,
}: EmptyHistoryStateProps) {
  if (isFiltered && filteredLabels) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-16 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
          <ScanLine className="size-7 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          {filteredLabels.title}
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {filteredLabels.description}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
        <ScanLine className="size-7 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-foreground">
        {labels.title}
      </h3>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {labels.description}
      </p>
      <button
        type="button"
        onClick={onScan}
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <ScanLine className="size-4" aria-hidden="true" />
        {labels.scanButton}
      </button>
    </div>
  );
}
