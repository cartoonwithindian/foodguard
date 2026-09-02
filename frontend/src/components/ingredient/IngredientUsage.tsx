"use client";

import { Cog } from "lucide-react";
import type { IngredientLabels } from "@/data/ingredient-labels";

type IngredientUsageProps = {
  whyUsed: string;
  functionLabel: string;
  labels: IngredientLabels["whyUsed"];
};

export function IngredientUsage({
  whyUsed,
  functionLabel,
  labels,
}: IngredientUsageProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
          <Cog className="size-5 text-primary" aria-hidden="true" />
        </div>
        <h2 className="text-base font-semibold text-foreground">{labels.title}</h2>
      </div>

      <div className="mb-3">
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          {functionLabel}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">{whyUsed}</p>
    </div>
  );
}
