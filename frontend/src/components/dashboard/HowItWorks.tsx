"use client";

import { ScanLine, Cpu, Lightbulb, GitCompare } from "lucide-react";
import type { DashboardLabels } from "@/data/dashboard-labels";

type HowItWorksProps = {
  labels: DashboardLabels["howItWorks"];
};

const stepIcons = [ScanLine, Cpu, Lightbulb, GitCompare];

export function HowItWorks({ labels }: HowItWorksProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <h2 className="mb-5 text-base font-semibold text-foreground">{labels.title}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {labels.steps.map((step, i) => {
          const Icon = stepIcons[i] ?? ScanLine;
          return (
            <div key={step.number} className="flex flex-col items-center text-center">
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="size-5 text-primary" aria-hidden="true" />
              </div>
              <span className="text-xs font-bold text-primary/60">{step.number}</span>
              <p className="mt-1 text-sm font-medium text-foreground">{step.label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
