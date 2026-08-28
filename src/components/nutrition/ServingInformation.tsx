"use client";

import { Coffee } from "lucide-react";
import type { NutritionLabels } from "@/data/nutrition-labels";

type ServingInformationProps = {
  servingSize: string;
  servingsPerContainer?: string;
  labels: NutritionLabels["serving"];
};

export function ServingInformation({
  servingSize,
  servingsPerContainer,
  labels,
}: ServingInformationProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
          <Coffee className="size-5 text-primary" aria-hidden="true" />
        </div>
        <h2 className="text-base font-semibold text-foreground">{labels.title}</h2>
      </div>

      <div className="space-y-2.5">
        <div className="rounded-xl border border-border bg-background p-3.5">
          <span className="text-xs text-muted-foreground">{labels.servingSize}</span>
          <p className="mt-0.5 text-sm font-medium text-foreground">{servingSize}</p>
        </div>
        {servingsPerContainer && (
          <div className="rounded-xl border border-border bg-background p-3.5">
            <span className="text-xs text-muted-foreground">{labels.servingsPerContainer}</span>
            <p className="mt-0.5 text-sm font-medium text-foreground">{servingsPerContainer}</p>
          </div>
        )}
      </div>
    </div>
  );
}
