"use client";

import { BookOpen, ExternalLink } from "lucide-react";
import type { IngredientLabels } from "@/data/ingredient-labels";

type IngredientDescriptionProps = {
  description: string;
  learnMoreUrl?: string;
  labels: IngredientLabels["whatIsIt"];
};

export function IngredientDescription({
  description,
  learnMoreUrl,
  labels,
}: IngredientDescriptionProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
          <BookOpen className="size-5 text-primary" aria-hidden="true" />
        </div>
        <h2 className="text-base font-semibold text-foreground">{labels.title}</h2>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>

      {learnMoreUrl && (
        <a
          href={learnMoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {labels.learnMore}
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      )}
    </div>
  );
}
