"use client";

import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DataQualityInfo } from "@/data/ingredient-data";
import type { IngredientLabels } from "@/data/ingredient-labels";

type DataQualityProps = {
  dataQuality: DataQualityInfo;
  labels: IngredientLabels["dataQuality"];
};

const levelConfig: Record<
  string,
  { colors: { bg: string; text: string; border: string } }
> = {
  high: {
    colors: { bg: "bg-green-50 dark:bg-green-950/40", text: "text-green-700 dark:text-green-400", border: "border-green-200 dark:border-green-900/50" },
  },
  medium: {
    colors: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-900/50" },
  },
  low: {
    colors: { bg: "bg-red-50 dark:bg-red-950/40", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-900/50" },
  },
};

export function DataQuality({ dataQuality, labels }: DataQualityProps) {
  const config = levelConfig[dataQuality.level] ?? levelConfig.medium;
  const labelText = labels[dataQuality.level] ?? dataQuality.level;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
          <BarChart3 className="size-5 text-primary" aria-hidden="true" />
        </div>
        <h2 className="text-base font-semibold text-foreground">{labels.title}</h2>
      </div>

      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
            config.colors.bg,
            config.colors.text,
            config.colors.border,
          )}
        >
          {labelText}
        </span>
      </div>

      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
        {dataQuality.explanation}
      </p>
    </div>
  );
}
