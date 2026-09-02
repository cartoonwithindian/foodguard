import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type OptionCardProps = {
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
  icon?: React.ReactNode;
};

export function OptionCard({
  label,
  description,
  selected,
  onSelect,
  icon,
}: OptionCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "group flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-[background-color,border-color,box-shadow] duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-primary/8 shadow-[0_0_0_1px_rgba(22,101,52,0.12)]"
          : "border-border bg-card hover:border-primary/35 hover:bg-muted/50",
      )}
    >
      {icon && <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>}
      <span className="flex-1">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {description}
          </span>
        )}
      </span>
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-150",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/25 bg-transparent text-transparent group-hover:border-primary/40",
        )}
        aria-hidden="true"
      >
        <Check className="size-3 stroke-[2.5]" />
      </span>
    </button>
  );
}
