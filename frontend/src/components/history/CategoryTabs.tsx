"use client";

import { cn } from "@/lib/utils";
import type { HistoryLabels } from "@/data/history-labels";

type CategoryTabsProps = {
  labels: HistoryLabels["tabs"];
  active: "all" | "high" | "moderate" | "low";
  onChange: (tab: "all" | "high" | "moderate" | "low") => void;
};

const TABS = ["all", "high", "moderate", "low"] as const;

const TAB_ACTIVE_COLORS: Record<string, string> = {
  high: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400",
  moderate: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400",
  low: "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400",
};

export function CategoryTabs({ labels, active, onChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {TABS.map((tab) => {
        const isActive = tab === active;
        const label = labels[tab];
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={cn(
              "shrink-0 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              isActive
                ? TAB_ACTIVE_COLORS[tab]
                : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
            )}
            aria-pressed={isActive}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
