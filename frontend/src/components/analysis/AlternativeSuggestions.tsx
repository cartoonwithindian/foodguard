"use client";

import { useState } from "react";
import { Copy, Check, Leaf, Info } from "lucide-react";
import type { AlternativeSuggestion } from "@/data/analysis-data";

type AlternativeSuggestionsProps = {
  title: string;
  description: string;
  copyButton: string;
  copiedLabel: string;
  pasteNote: string;
  suggestions: AlternativeSuggestion[];
  ingredientList: string[];
};

export function AlternativeSuggestions({
  title,
  description,
  copyButton,
  copiedLabel,
  pasteNote,
  suggestions,
  ingredientList,
}: AlternativeSuggestionsProps) {
  const [copied, setCopied] = useState(false);

  if (suggestions.length === 0) return null;

  const handleCopy = async () => {
    const text = ingredientList.join(", ");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-3">
        {suggestions.map((s, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50/50 p-3 dark:border-green-900/50 dark:bg-green-950/40"
          >
            <Leaf
              className="size-4 shrink-0 text-green-600 dark:text-green-400 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-medium text-foreground">{s.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                {s.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      {ingredientList.length > 0 && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            {copied ? (
              <>
                <Check className="size-4 text-green-600" aria-hidden="true" />
                {copiedLabel}
              </>
            ) : (
              <>
                <Copy className="size-4" aria-hidden="true" />
                {copyButton}
              </>
            )}
          </button>
          {copied && (
            <div className="flex items-start gap-2 rounded-xl bg-muted/50 px-3 py-2">
              <Info
                className="size-3.5 shrink-0 text-muted-foreground mt-0.5"
                aria-hidden="true"
              />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {pasteNote}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
