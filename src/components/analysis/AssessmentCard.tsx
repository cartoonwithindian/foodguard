import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import type { AssessmentLevel } from "@/data/analysis-data";

type AssessmentCardProps = {
  level: AssessmentLevel;
  label: string;
  description: string;
  score: number;
};

const CONFIG: Record<
  AssessmentLevel,
  {
    icon: typeof CheckCircle2;
    bg: string;
    iconColor: string;
    borderColor: string;
    labelColor: string;
  }
> = {
  low: {
    icon: CheckCircle2,
    bg: "bg-green-50 dark:bg-green-950/40",
    iconColor: "text-green-600 dark:text-green-400",
    borderColor: "border-green-200 dark:border-green-900/50",
    labelColor: "text-green-700 dark:text-green-400",
  },
  moderate: {
    icon: AlertCircle,
    bg: "bg-amber-50 dark:bg-amber-950/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-900/50",
    labelColor: "text-amber-700 dark:text-amber-400",
  },
  high: {
    icon: AlertTriangle,
    bg: "bg-red-50 dark:bg-red-950/40",
    iconColor: "text-red-600 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-900/50",
    labelColor: "text-red-700 dark:text-red-400",
  },
  insufficient: {
    icon: HelpCircle,
    bg: "bg-gray-50 dark:bg-gray-900/40",
    iconColor: "text-gray-500 dark:text-gray-400",
    borderColor: "border-gray-200 dark:border-gray-800",
    labelColor: "text-gray-600 dark:text-gray-400",
  },
};

export function AssessmentCard({
  level,
  label,
  description,
  score,
}: AssessmentCardProps) {
  const config = CONFIG[level];
  const Icon = config.icon;

  const scoreColor =
    score >= 80
      ? "text-green-600 dark:text-green-400"
      : score >= 50
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";

  return (
    <div
      className={`flex flex-col items-center gap-4 rounded-2xl border ${config.borderColor} ${config.bg} p-6 text-center`}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-white/80 dark:bg-white/10">
        <Icon className={`size-7 ${config.iconColor}`} aria-hidden="true" />
      </div>
      <div>
        <h2 className={`text-lg font-bold ${config.labelColor}`}>{label}</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm leading-relaxed">
          {description}
        </p>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold ${scoreColor}`}>{score}</span>
        <span className="text-sm text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}
