"use client";

import { MessageCircle } from "lucide-react";
import type { NutritionLabels } from "@/data/nutrition-labels";

type NutritionContextProps = {
  context: string;
  labels: NutritionLabels["context"];
};

export function NutritionContext({ context, labels }: NutritionContextProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
          <MessageCircle className="size-5 text-primary" aria-hidden="true" />
        </div>
        <h2 className="text-base font-semibold text-foreground">{labels.title}</h2>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">{context}</p>
    </div>
  );
}
