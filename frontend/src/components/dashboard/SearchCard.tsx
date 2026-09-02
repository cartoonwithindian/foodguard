"use client";

import { Search } from "lucide-react";
import type { DashboardLabels } from "@/data/dashboard-labels";

type SearchCardProps = {
  labels: DashboardLabels["search"];
  onClick: () => void;
};

export function SearchCard({ labels, onClick }: SearchCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
          <Search className="size-5 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">{labels.title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{labels.subtitle}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClick}
        className="flex h-11 w-full items-center gap-3 rounded-xl border border-border bg-background px-4 text-left text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <Search className="size-4 shrink-0" aria-hidden="true" />
        {labels.placeholder}
      </button>
    </div>
  );
}
