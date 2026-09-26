"use client";

import { Target, ArrowRight } from "lucide-react";
import type { DashboardLabels } from "@/data/dashboard-labels";
import type { UserPreference } from "@/data/mock-data";

type PersonalizedInsightProps = {
  labels: DashboardLabels["personalized"];
  preferences: UserPreference;
  onEdit: () => void;
};

export function PersonalizedInsight({
  labels,
  preferences,
  onEdit,
}: PersonalizedInsightProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
          <Target className="size-5 text-primary" aria-hidden="true" />
        </div>
        <h2 className="text-base font-semibold text-foreground">{labels.title}</h2>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{labels.goalLabel}:</span>
          <span className="text-sm font-medium text-foreground">{preferences.goal}</span>
        </div>
        {preferences.focuses.map((focus) => (
          <div key={focus} className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{labels.focusLabel}:</span>
            <span className="text-sm font-medium text-foreground">{focus}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onEdit}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {labels.editButton}
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
