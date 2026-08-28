"use client";

import { ChevronRight, ScanLine } from "lucide-react";
import type { DashboardLabels } from "@/data/dashboard-labels";
import type { ScannedProduct } from "@/data/mock-data";
import { CATEGORY_LABELS, CONCERN_COLORS } from "@/data/mock-data";

type RecentScansProps = {
  labels: DashboardLabels["recentScans"];
  scans: ScannedProduct[];
  onViewAll: () => void;
  onScan: () => void;
  hasScans: boolean;
};

export function RecentScans({
  labels,
  scans,
  onViewAll,
  onScan,
  hasScans,
}: RecentScansProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">{labels.title}</h2>
        {hasScans && (
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {labels.viewAll}
          </button>
        )}
      </div>

      {!hasScans ? (
        <div className="rounded-xl border border-dashed border-border py-10 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-muted">
            <ScanLine className="size-6 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-foreground">{labels.noScansTitle}</p>
          <p className="mt-1 text-xs text-muted-foreground">{labels.noScansDescription}</p>
          <button
            type="button"
            onClick={onScan}
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <ScanLine className="size-4" aria-hidden="true" />
            {labels.noScansButton}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {scans.slice(0, 5).map((product) => {
            const colors = CONCERN_COLORS[product.concern];
            const concernLabel =
              product.concern === "high"
                ? "High Concern"
                : product.concern === "moderate"
                  ? "Moderate"
                  : "Low Concern";

            return (
              <div
                key={product.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-background p-3.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {product.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {CATEGORY_LABELS[product.category]}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${colors.dot}`}
                        aria-hidden="true"
                      />
                      {concernLabel}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {labels.scannedLabel.replace("{time}", product.scannedAt)}
                    </span>
                  </div>
                </div>
                <ChevronRight
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
