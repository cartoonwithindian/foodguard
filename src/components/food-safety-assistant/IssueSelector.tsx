"use client";

import type { IssueType } from "@/types/food-safety-assistant";

export type IssueSelectorProps = {
  options: Array<{ value: IssueType; label: string; description: string }>;
  onChoose: (issue: IssueType) => void;
};

export function IssueSelector({ options, onChoose }: IssueSelectorProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-base font-semibold text-foreground">Which best describes the issue?</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Pick the option that matches what you observed. You can change it later.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {options.map((o) => (
          <button
            type="button"
            key={o.value}
            onClick={() => onChoose(o.value)}
            className="flex flex-col items-start gap-1 rounded-xl border border-border bg-background p-3 text-left text-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
            data-testid={`assistant-issue-${o.value}`}
          >
            <span className="font-medium text-foreground">{o.label}</span>
            <span className="text-xs text-muted-foreground">{o.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
