"use client";

import { Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AssessmentLevel } from "@/data/analysis-data";
import type { RelatedIngredient } from "@/data/ingredient-data";
import type { IngredientLabels } from "@/data/ingredient-labels";

type RelatedIngredientsProps = {
  related: RelatedIngredient[];
  labels: IngredientLabels["related"];
  onIngredientClick: (id: string) => void;
};

const assessmentDot: Record<AssessmentLevel, string> = {
  low: "bg-green-500",
  moderate: "bg-amber-500",
  high: "bg-red-500",
  insufficient: "bg-gray-400",
};

const assessmentText: Record<AssessmentLevel, string> = {
  low: "Low Concern",
  moderate: "Moderate",
  high: "High Attention",
  insufficient: "Insufficient",
};

export function RelatedIngredients({
  related,
  labels,
  onIngredientClick,
}: RelatedIngredientsProps) {
  if (related.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
          <LinkIcon className="size-5 text-primary" aria-hidden="true" />
        </div>
        <h2 className="text-base font-semibold text-foreground">{labels.title}</h2>
      </div>

      <div className="space-y-2">
        {related.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onIngredientClick(item.id)}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-background p-3.5 text-left transition-colors hover:border-primary/30 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{item.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.function}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className={cn("size-2 rounded-full", assessmentDot[item.assessment])}
                  aria-hidden="true"
                />
                {assessmentText[item.assessment]}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
