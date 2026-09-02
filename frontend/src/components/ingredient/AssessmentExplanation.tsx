"use client";

import {
  AlertTriangle,
  Minus,
  CheckCircle,
  HelpCircle,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AssessmentLevel } from "@/data/analysis-data";
import type { IngredientLabels } from "@/data/ingredient-labels";

type AssessmentExplanationProps = {
  assessment: AssessmentLevel;
  flagExplanation: string;
  factorsConsidered: string[];
  labels: IngredientLabels["assessment"];
};

const assessmentStyles: Record<
  AssessmentLevel,
  {
    icon: typeof AlertTriangle;
    colors: { bg: string; text: string; border: string };
  }
> = {
  low: {
    icon: CheckCircle,
    colors: { bg: "bg-green-50 dark:bg-green-950/40", text: "text-green-700 dark:text-green-400", border: "border-green-200 dark:border-green-900/50" },
  },
  moderate: {
    icon: Minus,
    colors: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-900/50" },
  },
  high: {
    icon: AlertTriangle,
    colors: { bg: "bg-red-50 dark:bg-red-950/40", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-900/50" },
  },
  insufficient: {
    icon: HelpCircle,
    colors: { bg: "bg-gray-50 dark:bg-gray-900/40", text: "text-gray-600 dark:text-gray-400", border: "border-gray-200 dark:border-gray-800" },
  },
};

export function AssessmentExplanation({
  assessment,
  flagExplanation,
  factorsConsidered,
  labels,
}: AssessmentExplanationProps) {
  const config = assessmentStyles[assessment];
  const Icon = config.icon;
  const assessmentLabel = labels[assessment] ?? assessment;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
          <Shield className="size-5 text-primary" aria-hidden="true" />
        </div>
        <h2 className="text-base font-semibold text-foreground">{labels.title}</h2>
      </div>

      <div
        className={cn(
          "mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5",
          config.colors.bg,
          config.colors.border,
        )}
      >
        <Icon className={cn("size-4", config.colors.text)} aria-hidden="true" />
        <span className={cn("text-sm font-medium", config.colors.text)}>
          {assessmentLabel}
        </span>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        {flagExplanation}
      </p>

      {factorsConsidered.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-foreground">
            {labels.factorsTitle}
          </h3>
          <ul className="space-y-1.5">
            {factorsConsidered.map((factor, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/40" aria-hidden="true" />
                {factor}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
