"use client";

import { ScanLine } from "lucide-react";
import type { DashboardLabels } from "@/data/dashboard-labels";

type ScanHeroCardProps = {
  labels: DashboardLabels["scan"];
  onScan: () => void;
};

export function ScanHeroCard({ labels, onScan }: ScanHeroCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left">
        <div className="mb-4 sm:mb-0 sm:mr-6">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 sm:mx-0">
            <ScanLine className="size-7 text-primary" aria-hidden="true" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
            {labels.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {labels.subtitle}
          </p>
        </div>
        <div className="mt-5 sm:mt-0 sm:ml-6">
          <button
            type="button"
            onClick={onScan}
            className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-primary px-7 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 active:bg-primary/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <ScanLine className="size-4.5" aria-hidden="true" />
            {labels.scanButton}
          </button>
        </div>
      </div>
    </div>
  );
}
