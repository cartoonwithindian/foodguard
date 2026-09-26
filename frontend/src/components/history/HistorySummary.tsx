"use client";

import { AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import type { HistoryLabels } from "@/data/history-labels";

type SummaryCardProps = {
  level: "high" | "moderate" | "low";
  count: number;
  label: string;
  onClick?: () => void;
};

function SummaryCard({ level, count, label, onClick }: SummaryCardProps) {
  const config = {
    high: {
      Icon: AlertTriangle,
      dot: "bg-red-500",
      text: "text-red-700 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/40",
      border: "border-red-200 dark:border-red-900/50",
      hoverBorder: "hover:border-red-300",
    },
    moderate: {
      Icon: AlertCircle,
      dot: "bg-amber-500",
      text: "text-amber-700 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-200 dark:border-amber-900/50",
      hoverBorder: "hover:border-amber-300",
    },
    low: {
      Icon: CheckCircle2,
      dot: "bg-green-600",
      text: "text-green-700 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950/40",
      border: "border-green-200 dark:border-green-900/50",
      hoverBorder: "hover:border-green-300",
    },
  }[level];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-2 rounded-2xl border ${config.border} ${config.bg} p-5 text-center shadow-sm transition-all ${config.hoverBorder} hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
    >
      <config.Icon className={`size-6 ${config.text}`} aria-hidden="true" />
      <span className={`text-3xl font-bold ${config.text}`}>{count}</span>
      <span className="flex items-center gap-1.5">
        <span className={`size-2 rounded-full ${config.dot}`} aria-hidden="true" />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </span>
    </button>
  );
}

type HistorySummaryProps = {
  labels: HistoryLabels["summary"];
  counts: { high: number; moderate: number; low: number };
  onHighClick?: () => void;
  onModerateClick?: () => void;
  onLowClick?: () => void;
};

export function HistorySummary({
  labels,
  counts,
  onHighClick,
  onModerateClick,
  onLowClick,
}: HistorySummaryProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground">{labels.title}</h2>
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard
          level="high"
          count={counts.high}
          label={labels.high}
          onClick={onHighClick}
        />
        <SummaryCard
          level="moderate"
          count={counts.moderate}
          label={labels.moderate}
          onClick={onModerateClick}
        />
        <SummaryCard
          level="low"
          count={counts.low}
          label={labels.low}
          onClick={onLowClick}
        />
      </div>
    </div>
  );
}
