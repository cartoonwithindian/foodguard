"use client";

import { Info } from "lucide-react";

type AlternativeSectionProps = {
  title: string;
  description: string;
  disclaimer: string;
};

export function AlternativeSection({
  title,
  description,
  disclaimer,
}: AlternativeSectionProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3">
        <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <p className="text-xs text-muted-foreground">{disclaimer}</p>
      </div>
    </div>
  );
}
