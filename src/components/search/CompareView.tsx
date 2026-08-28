"use client";

import { ArrowLeft, Check } from "lucide-react";
import { CATEGORY_LABELS, CONCERN_COLORS } from "@/data/mock-data";
import type { SearchProduct } from "@/data/search-data";

type CompareViewProps = {
  products: SearchProduct[];
  labels: {
    title: string;
    subtitle: string;
    backButton: string;
    nutrition: string;
    ingredients: string;
    assessment: string;
    positivePoints: string;
    attentionPoints: string;
    ingredientDifferences: string;
    servingSize: string;
    calories: string;
    sugar: string;
    sodium: string;
    saturatedFat: string;
    protein: string;
    fibre: string;
    sharedIngredients: string;
    uniqueToProduct: string;
  };
  onBack: () => void;
};

export function CompareView({ products, labels, onBack }: CompareViewProps) {
  if (products.length < 2) return null;

  const allIngredients = new Set<string>();
  products.forEach((p) => p.ingredients.forEach((i) => allIngredients.add(i)));

  const sharedIngredients = products[0].ingredients.filter((ing) =>
    products.every((p) => p.ingredients.includes(ing)),
  );

  const nutritionRows = [
    { key: "calories", label: labels.calories, getValue: (p: SearchProduct) => String(p.nutrition.calories) },
    { key: "sugar", label: labels.sugar, getValue: (p: SearchProduct) => p.nutrition.sugar },
    { key: "sodium", label: labels.sodium, getValue: (p: SearchProduct) => p.nutrition.sodium },
    { key: "saturatedFat", label: labels.saturatedFat, getValue: (p: SearchProduct) => p.nutrition.saturatedFat },
    { key: "protein", label: labels.protein, getValue: (p: SearchProduct) => p.nutrition.protein },
    { key: "fibre", label: labels.fibre, getValue: (p: SearchProduct) => p.nutrition.fibre },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {labels.backButton}
          </button>
          <h1 className="ml-4 text-sm font-semibold text-foreground">
            {labels.title}
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <p className="mb-6 text-sm text-muted-foreground">{labels.subtitle}</p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr>
                <th className="w-48 border-b border-border bg-card p-4 text-left text-sm font-semibold text-foreground">
                  {/* empty corner */}
                </th>
                {products.map((p) => {
                  const colors = CONCERN_COLORS[p.concernLevel];
                  return (
                    <th
                      key={p.id}
                      className="min-w-[200px] border-b border-border bg-card p-4 text-left"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {p.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {p.brand} · {CATEGORY_LABELS[p.category]}
                      </p>
                      <span
                        className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
                      >
                        <span className={`size-1.5 rounded-full ${colors.dot}`} />
                        Score: {p.score}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Nutrition */}
              <tr>
                <td
                  colSpan={products.length + 1}
                  className="border-b border-border bg-muted/30 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {labels.nutrition}
                </td>
              </tr>
              {nutritionRows.map((row) => (
                <tr key={row.key} className="border-b border-border">
                  <td className="bg-card p-4 text-sm font-medium text-foreground">
                    {row.label}
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="bg-card p-4 text-sm text-foreground">
                      {row.getValue(p)}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Serving Size */}
              <tr className="border-b border-border">
                <td className="bg-card p-4 text-sm font-medium text-foreground">
                  {labels.servingSize}
                </td>
                {products.map((p) => (
                  <td key={p.id} className="bg-card p-4 text-sm text-foreground">
                    {p.nutrition.servingSize}
                  </td>
                ))}
              </tr>

              {/* Ingredients */}
              <tr>
                <td
                  colSpan={products.length + 1}
                  className="border-b border-border bg-muted/30 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {labels.ingredients}
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="bg-card p-4 text-sm font-medium text-foreground">
                  {labels.sharedIngredients}
                </td>
                {products.map((p) => (
                  <td key={p.id} className="bg-card p-4">
                    <div className="flex flex-wrap gap-1">
                      {sharedIngredients.map((ing) => (
                        <span
                          key={ing}
                          className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700"
                        >
                          <Check className="size-2.5" aria-hidden="true" />
                          {ing}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              {products.map((p) => {
                const unique = p.ingredients.filter(
                  (ing) => !sharedIngredients.includes(ing),
                );
                return (
                  <tr key={p.id} className="border-b border-border">
                    <td className="bg-card p-4 text-sm font-medium text-foreground">
                      {labels.uniqueToProduct}
                      <br />
                      <span className="text-xs font-normal text-muted-foreground">
                        {p.name}
                      </span>
                    </td>
                    <td
                      colSpan={products.length}
                      className="bg-card p-4"
                    >
                      <div className="flex flex-wrap gap-1">
                        {unique.length > 0 ? (
                          unique.map((ing) => (
                            <span
                              key={ing}
                              className="rounded-full bg-muted px-2 py-0.5 text-xs text-foreground"
                            >
                              {ing}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            None — identical ingredient list
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Assessment */}
              <tr>
                <td
                  colSpan={products.length + 1}
                  className="border-b border-border bg-muted/30 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {labels.assessment}
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="bg-card p-4 text-sm font-medium text-foreground">
                  {labels.positivePoints}
                </td>
                {products.map((p) => (
                  <td key={p.id} className="bg-card p-4">
                    <ul className="space-y-1">
                      {p.matchReasons.slice(0, 3).map((reason) => (
                        <li
                          key={reason}
                          className="flex items-start gap-1.5 text-xs text-foreground"
                        >
                          <Check
                            className="mt-0.5 size-3 shrink-0 text-green-600"
                            aria-hidden="true"
                          />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
