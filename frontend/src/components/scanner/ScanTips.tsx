"use client";

import { useState } from "react";
import { ChevronDown, Lightbulb } from "lucide-react";

type ScanTipsProps = {
  title: string;
  items: string[];
};

export function ScanTips({ title, items }: ScanTipsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
      >
        <span className="inline-flex items-center gap-2">
          <Lightbulb className="size-4 text-muted-foreground" aria-hidden="true" />
          {title}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div className="border-t border-border px-4 py-3">
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="mt-1 size-1 shrink-0 rounded-full bg-muted-foreground" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
