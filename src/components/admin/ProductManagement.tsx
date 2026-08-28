"use client";

import { useState } from "react";
import { Search, Plus, Eye, Pencil, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductEntry, ProductDataStatus, ProcessingStatus } from "@/data/admin-data";
import type { AdminLabels } from "@/data/admin-labels";

type ProductManagementProps = {
  products: ProductEntry[];
  labels: AdminLabels["productManagement"];
};

const DATA_STATUS_STYLES: Record<ProductDataStatus, { dot: string; text: string; bg: string }> = {
  complete: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  incomplete: { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  needs_review: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
};

const DATA_STATUS_LABELS: Record<ProductDataStatus, string> = {
  complete: "complete",
  incomplete: "incomplete",
  needs_review: "needsReview",
};

const ANALYSIS_STATUS_STYLES: Record<ProcessingStatus, string> = {
  completed: "text-emerald-700",
  processing: "text-amber-700",
  failed: "text-red-700",
  insufficient_data: "text-gray-600",
};

export function ProductManagement({ products, labels }: ProductManagementProps) {
  const [search, setSearch] = useState("");
  const [confirmArchive, setConfirmArchive] = useState<string | null>(null);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-foreground">{labels.title}</h2>
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
            <span className="hidden sm:inline">{labels.addProduct}</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                {labels.columns.product}
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                {labels.columns.category}
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                {labels.columns.barcode}
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                {labels.columns.dataStatus}
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                {labels.columns.lastUpdated}
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                {labels.columns.analysisStatus}
              </th>
              <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                {labels.columns.actions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((product) => {
              const dataStyle = DATA_STATUS_STYLES[product.dataStatus];
              const dataKey = DATA_STATUS_LABELS[product.dataStatus];
              const dataLabel = dataKey === "complete" ? labels.complete : dataKey === "incomplete" ? labels.incomplete : labels.needsReview;
              const analysisStyle = ANALYSIS_STATUS_STYLES[product.analysisStatus];
              return (
                <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">
                    {product.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {product.category}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                    {product.barcode}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                        dataStyle.bg,
                        dataStyle.text,
                      )}
                    >
                      <span className={cn("size-1.5 rounded-full", dataStyle.dot)} aria-hidden="true" />
                      {dataLabel}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {product.lastUpdated}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={cn("text-xs font-medium capitalize", analysisStyle)}>
                      {product.analysisStatus.replace("_", " ")}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={labels.viewProduct}
                        title={labels.viewProduct}
                      >
                        <Eye className="size-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={labels.editProduct}
                        title={labels.editProduct}
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmArchive(product.id)}
                        className="inline-flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-700"
                        aria-label={labels.archiveProduct}
                        title={labels.archiveProduct}
                      >
                        <Archive className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Archive confirmation modal */}
      {confirmArchive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setConfirmArchive(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 mx-4 w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-base font-semibold text-foreground">
              {labels.archiveConfirm}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{labels.archiveMessage}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmArchive(null)}
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {labels.cancel}
              </button>
              <button
                type="button"
                onClick={() => setConfirmArchive(null)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                {labels.archiveProduct}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
