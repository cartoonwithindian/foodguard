"use client";

import { useState } from "react";
import { Search, Plus, Eye, Pencil, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IngredientEntry } from "@/data/admin-data";
import type { AdminLabels } from "@/data/admin-labels";

type IngredientManagementProps = {
  ingredients: IngredientEntry[];
  labels: AdminLabels["ingredientManagement"];
};

const ASSESSMENT_STYLES: Record<string, { dot: string; text: string; bg: string }> = {
  low: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  moderate: { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  high: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
  insufficient: { dot: "bg-gray-400", text: "text-gray-600", bg: "bg-gray-50" },
};

export function IngredientManagement({ ingredients, labels }: IngredientManagementProps) {
  const [search, setSearch] = useState("");

  const filtered = ingredients.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.code.toLowerCase().includes(search.toLowerCase()) ||
      i.function.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">{labels.title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{labels.editWarning}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={labels.search}
              className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:w-56"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{labels.addIngredient}</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                {labels.columns.ingredient}
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                {labels.columns.code}
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                {labels.columns.function}
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                {labels.columns.category}
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                {labels.columns.assessmentStatus}
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                {labels.columns.evidenceAvailability}
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                {labels.columns.lastUpdated}
              </th>
              <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                {labels.columns.actions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((ingredient) => {
              const style = ASSESSMENT_STYLES[ingredient.assessmentStatus] ?? ASSESSMENT_STYLES.insufficient;
              return (
                <tr key={ingredient.id} className="hover:bg-muted/30 transition-colors">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">
                    {ingredient.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                    {ingredient.code}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {ingredient.function}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {ingredient.category}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                        style.bg,
                        style.text,
                      )}
                    >
                      <span className={cn("size-1.5 rounded-full", style.dot)} aria-hidden="true" />
                      {ingredient.assessmentStatus}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {ingredient.evidenceAvailable ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                        <BookOpen className="size-3" aria-hidden="true" />
                        {labels.evidenceAvailable}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                        {labels.noEvidence}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {ingredient.lastUpdated}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={labels.viewIngredient}
                        title={labels.viewIngredient}
                      >
                        <Eye className="size-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={labels.editIngredient}
                        title={labels.editIngredient}
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-blue-50 hover:text-blue-700"
                        aria-label={labels.addEvidence}
                        title={labels.addEvidence}
                      >
                        <BookOpen className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
