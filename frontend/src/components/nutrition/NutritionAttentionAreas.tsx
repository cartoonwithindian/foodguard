"use client";

import { AlertTriangle, Minus, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NutritionAttentionArea } from "@/data/nutrition-data";
import type { NutritionLabels } from "@/data/nutrition-labels";

type NutritionAttentionAreasProps = {
  areas: NutritionAttentionArea[];
  labels: NutritionLabels["attention"];
};

const severityConfig: Record<
  string,
  { icon: typeof AlertTriangle; colors: { bg: string; text: string; border: string }; label: string }
> = {
  low: {
    icon: Minus,
    colors: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-900/50" },
    label: "Worth noting",
  },
  moderate: {
    icon: AlertCircle,
    colors: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-900/50" },
    label: "Deserves attention",
  },
  high: {
    icon: AlertTriangle,
    colors: { bg: "bg-red-50 dark:bg-red-950/40", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-900/50" },
    label: "Significant",
  },
};

export function NutritionAttentionAreas({
  areas,
  labels,
}: NutritionAttentionAreasProps) {
  if (areas.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-foreground">{labels.title}</h2>

      <div className="space-y-2.5">
        {areas.map((area) => {
          const config = severityConfig[area.severity] ?? severityConfig.low;
          const Icon = config.icon;

          return (
            <div
              key={area.name}
              className={cn(
                "rounded-xl border p-4",
                config.colors.border,
                config.colors.bg,
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className={cn("mt-0.5 size-4 shrink-0", config.colors.text)} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm font-medium", config.colors.text)}>
                      {area.name}
                    </p>
                    <span className="text-xs text-muted-foreground">&middot; {area.value}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{area.reason}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
