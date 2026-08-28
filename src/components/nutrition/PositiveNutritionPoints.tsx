"use client";

import { CheckCircle } from "lucide-react";
import type { NutritionPositivePoint } from "@/data/nutrition-data";
import type { NutritionLabels } from "@/data/nutrition-labels";

type PositiveNutritionPointsProps = {
  points: NutritionPositivePoint[];
  labels: NutritionLabels["positive"];
};

export function PositiveNutritionPoints({
  points,
  labels,
}: PositiveNutritionPointsProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-foreground">{labels.title}</h2>

      {points.length === 0 ? (
        <p className="text-sm text-muted-foreground">{labels.noPositivePoints}</p>
      ) : (
        <div className="space-y-2.5">
          {points.map((point) => (
            <div
              key={point.name}
              className="flex items-start gap-3 rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-950/40 p-4"
            >
               <CheckCircle className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                   <p className="text-sm font-medium text-green-700 dark:text-green-400">{point.name}</p>
                  <span className="text-xs text-muted-foreground">&middot; {point.value}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{point.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
