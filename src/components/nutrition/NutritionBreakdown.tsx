"use client";

import { List } from "lucide-react";
import type { DetailedNutrition } from "@/data/nutrition-data";
import type { NutritionLabels } from "@/data/nutrition-labels";

type NutritionBreakdownProps = {
  nutrition: DetailedNutrition;
  labels: NutritionLabels["breakdown"];
};

const breakdownOrder: (keyof DetailedNutrition)[] = [
  "calories",
  "totalFat",
  "saturatedFat",
  "transFat",
  "cholesterol",
  "sodium",
  "totalCarbohydrates",
  "dietaryFibre",
  "totalSugars",
  "addedSugars",
  "protein",
  "salt",
  "vitaminD",
  "calcium",
  "iron",
  "potassium",
];

export function NutritionBreakdown({
  nutrition,
  labels,
}: NutritionBreakdownProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
          <List className="size-5 text-primary" aria-hidden="true" />
        </div>
        <h2 className="text-base font-semibold text-foreground">{labels.title}</h2>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                {labels.nutrient}
              </th>
              <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                {labels.amount}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {breakdownOrder.map((key) => {
              const field = nutrition[key] ?? {
                label: key === "salt" ? "Salt" : key,
                value: "—",
                unit: "",
                available: false,
              };
              return (
                <tr key={key} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 text-foreground">{field.label}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-foreground">
                    {field.available ? (
                      <span>
                        {field.value} {field.unit}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
