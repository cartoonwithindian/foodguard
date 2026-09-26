"use client";

import { Check, Circle, Minus } from "lucide-react";
import type { EvidenceRequirement } from "@/types/food-safety-assistant";

export type EvidenceChecklistProps = {
  requirements: EvidenceRequirement[];
};

const STATUS_ICON = {
  provided: { Icon: Check, className: "text-green-600 dark:text-green-400", label: "Provided" },
  not_provided: { Icon: Circle, className: "text-muted-foreground", label: "Not provided" },
  not_applicable: { Icon: Minus, className: "text-muted-foreground", label: "Not applicable" },
};

export function EvidenceChecklist({ requirements }: EvidenceChecklistProps) {
  if (requirements.length === 0) return null;
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-base font-semibold text-foreground">Evidence checklist</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        A factual complaint is most useful when paired with evidence. Items below show what was
        actually available — the assistant does not assume anything you did not confirm.
      </p>
      <ul className="mt-4 space-y-3">
        {requirements.map((req) => {
          const status = STATUS_ICON[req.status];
          return (
            <li
              key={req.key}
              className="flex items-start gap-3 rounded-xl border border-border bg-background p-3"
            >
              <status.Icon className={`mt-0.5 size-4 shrink-0 ${status.className}`} aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {req.label}{" "}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    ({status.label})
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">{req.description}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
