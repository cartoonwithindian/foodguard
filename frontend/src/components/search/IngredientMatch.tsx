"use client";

import { useState } from "react";
import { ChevronDown, Check, X as XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type IngredientMatchProps = {
  matchPercentage: number;
  matchedIngredients: string[];
  missingIngredients: string[];
  labels: {
    matchLabel: string;
    whyMatch: string;
    matchedIngredients: string;
    missingIngredients: string;
  };
};

export function IngredientMatch({
  matchPercentage,
  matchedIngredients,
  missingIngredients,
  labels,
}: IngredientMatchProps) {
  const [showDetails, setShowDetails] = useState(false);

  const color =
    matchPercentage >= 80
      ? "text-green-600"
      : matchPercentage >= 50
        ? "text-amber-600"
        : "text-red-600";

  const bgColor =
    matchPercentage >= 80
      ? "bg-green-50 border-green-200"
      : matchPercentage >= 50
        ? "bg-amber-50 border-amber-200"
        : "bg-red-50 border-red-200";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {labels.matchLabel}
        </span>
        <span className={cn("text-sm font-bold", color)}>
          {matchPercentage}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            matchPercentage >= 80
              ? "bg-green-500"
              : matchPercentage >= 50
                ? "bg-amber-500"
                : "bg-red-500",
          )}
          style={{ width: `${matchPercentage}%` }}
        />
      </div>
      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {labels.whyMatch}
        <ChevronDown
          className={cn(
            "size-3 transition-transform duration-200",
            showDetails && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>
      {showDetails && (
        <div className={cn("rounded-xl border p-3 space-y-2", bgColor)}>
          {matchedIngredients.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-foreground mb-1">
                {labels.matchedIngredients}
              </p>
              <div className="flex flex-wrap gap-1">
                {matchedIngredients.map((ing) => (
                  <span
                    key={ing}
                    className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700"
                  >
                    <Check className="size-2.5" aria-hidden="true" />
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}
          {missingIngredients.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-foreground mb-1">
                {labels.missingIngredients}
              </p>
              <div className="flex flex-wrap gap-1">
                {missingIngredients.map((ing) => (
                  <span
                    key={ing}
                    className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700"
                  >
                    <XIcon className="size-2.5" aria-hidden="true" />
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
