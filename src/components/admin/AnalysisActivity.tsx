"use client";

import { cn } from "@/lib/utils";
import type { AnalysisActivityEntry, ProcessingStatus, AssessmentLevel } from "@/data/admin-data";
import type { AdminLabels } from "@/data/admin-labels";

type AnalysisActivityProps = {
  entries: AnalysisActivityEntry[];
  labels: AdminLabels["analysisActivity"];
};

const STATUS_STYLES: Record<ProcessingStatus, { dot: string; text: string }> = {
  completed: { dot: "bg-emerald-500", text: "text-emerald-700" },
  processing: { dot: "bg-amber-500", text: "text-amber-700" },
  failed: { dot: "bg-red-500", text: "text-red-700" },
  insufficient_data: { dot: "bg-gray-400", text: "text-gray-600" },
};

const ASSESSMENT_STYLES: Record<AssessmentLevel, string> = {
  low: "text-emerald-700",
  moderate: "text-amber-700",
  high: "text-red-700",
  insufficient: "text-gray-600",
};

const STATUS_LABELS: Record<ProcessingStatus, keyof AdminLabels["analysisActivity"]> = {
  completed: "completed",
  processing: "processing",
  failed: "failed",
  insufficient_data: "insufficientData",
};

export function AnalysisActivity({ entries, labels }: AnalysisActivityProps) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground">{labels.title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-5 py-2.5 text-left font-medium text-muted-foreground">
                {labels.product}
              </th>
              <th className="px-5 py-2.5 text-left font-medium text-muted-foreground">
                {labels.user}
              </th>
              <th className="px-5 py-2.5 text-left font-medium text-muted-foreground">
                {labels.assessment}
              </th>
              <th className="px-5 py-2.5 text-left font-medium text-muted-foreground">
                {labels.date}
              </th>
              <th className="px-5 py-2.5 text-left font-medium text-muted-foreground">
                {labels.status}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((entry) => {
              const statusStyle = STATUS_STYLES[entry.status];
              const statusLabel = labels[STATUS_LABELS[entry.status]];
              return (
                <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                  <td className="whitespace-nowrap px-5 py-3 font-medium text-foreground">
                    {entry.productName}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                    {entry.userAnonymized}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <span
                      className={cn(
                        "text-sm font-medium capitalize",
                        ASSESSMENT_STYLES[entry.assessment],
                      )}
                    >
                      {entry.assessment}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                    {entry.date}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className={cn("size-1.5 rounded-full", statusStyle.dot)}
                        aria-hidden="true"
                      />
                      <span className={cn("text-xs font-medium", statusStyle.text)}>
                        {statusLabel}
                      </span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
