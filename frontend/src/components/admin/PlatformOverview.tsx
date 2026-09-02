"use client";

import { Users, Package, FlaskConical, BarChart3 } from "lucide-react";
import type { PlatformStats } from "@/data/admin-data";
import type { AdminLabels } from "@/data/admin-labels";

type PlatformOverviewProps = {
  stats: PlatformStats;
  labels: AdminLabels["overview"];
};

const CARDS = [
  { key: "totalUsers", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "totalProducts", icon: Package, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "totalIngredients", icon: FlaskConical, color: "text-violet-600", bg: "bg-violet-50" },
  { key: "totalAnalyses", icon: BarChart3, color: "text-amber-600", bg: "bg-amber-50" },
] as const;

export function PlatformOverview({ stats, labels }: PlatformOverviewProps) {
  return (
    <section>
      <h2 className="mb-4 text-base font-semibold text-foreground">{labels.title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => {
          const Icon = card.icon;
          const value = stats[card.key];
          const label = labels[card.key];
          return (
            <div
              key={card.key}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex size-10 items-center justify-center rounded-xl ${card.bg}`}
                >
                  <Icon className={`size-5 ${card.color}`} aria-hidden="true" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                {value.toLocaleString()}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
