"use client";

import { cn } from "@/lib/utils";
import type { SystemHealthEntry, ServiceStatus } from "@/data/admin-data";
import type { AdminLabels } from "@/data/admin-labels";

type ErrorMonitoringProps = {
  health: SystemHealthEntry[];
  labels: AdminLabels["errorMonitoring"];
};

const STATUS_CONFIG: Record<ServiceStatus, { icon: string; text: string; bg: string }> = {
  operational: { icon: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  degraded: { icon: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  unavailable: { icon: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
};

export function ErrorMonitoring({ health, labels }: ErrorMonitoringProps) {
  return (
    <section>
      <h2 className="mb-4 text-base font-semibold text-foreground">{labels.title}</h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {health.map((entry) => {
          const config = STATUS_CONFIG[entry.status];
          const statusLabel =
            entry.status === "operational"
              ? labels.operational
              : entry.status === "degraded"
                ? labels.degraded
                : labels.unavailable;
          return (
            <div
              key={entry.service}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn("size-2.5 rounded-full", config.icon)}
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{entry.service}</p>
                  <p className={cn("text-xs font-medium", config.text)}>{statusLabel}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {labels.lastUpdated}: {health[0]?.lastUpdated}
      </p>
    </section>
  );
}
