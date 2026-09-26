"use client";

import { LandPlot } from "lucide-react";

export type RegulatoryContextProps = {
  lines: string[];
};

export function RegulatoryContext({ lines }: RegulatoryContextProps) {
  if (lines.length === 0) return null;
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start gap-3">
        <LandPlot className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="flex-1">
          <h2 className="text-base font-semibold text-foreground">FSSAI / regulatory context</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Below is the regulatory context used in the draft. It is informational only — the
            assistant does not make legal conclusions.
          </p>
          <ul className="mt-4 space-y-2">
            {lines.map((line, idx) => (
              <li key={idx} className="text-sm text-foreground">{line}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
