"use client";

import type { AssessmentDistribution } from "@/data/admin-data";
import type { AdminLabels } from "@/data/admin-labels";

type ConcernDistributionProps = {
  distribution: AssessmentDistribution;
  labels: AdminLabels["concernDistribution"];
};

const BARS = [
  { key: "low" as const, color: "bg-emerald-500" },
  { key: "moderate" as const, color: "bg-amber-500" },
  { key: "high" as const, color: "bg-red-500" },
  { key: "insufficient" as const, color: "bg-gray-400" },
];

export function ConcernDistribution({
  distribution,
  labels,
}: ConcernDistributionProps) {
  const total =
    distribution.low + distribution.moderate + distribution.high + distribution.insufficient;

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-foreground">{labels.title}</h2>

      {/* Bar chart */}
      <div className="mb-4 flex h-40 items-end gap-3">
        {BARS.map((bar) => {
          const count = distribution[bar.key];
          const heightPct = total > 0 ? Math.max((count / total) * 100, 4) : 4;
          return (
            <div
              key={bar.key}
              className="flex flex-1 flex-col items-center gap-1.5"
            >
              <span className="text-xs font-medium text-foreground">
                {count.toLocaleString()}
              </span>
              <div className="flex w-full items-end" style={{ height: "120px" }}>
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${bar.color}`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {BARS.map((bar) => {
          const count = distribution[bar.key];
          const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
          return (
            <div key={bar.key} className="flex items-center gap-2">
              <span className={`size-2.5 rounded-sm ${bar.color}`} aria-hidden="true" />
              <span className="text-xs text-muted-foreground">
                {labels[bar.key]} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-muted-foreground italic">{labels.disclaimer}</p>
    </section>
  );
}
