import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type MultiSelectCardProps = {
  label: string;
  selected: boolean;
  onSelect: () => void;
};

export function MultiSelectCard({
  label,
  selected,
  onSelect,
}: MultiSelectCardProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "group flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-[background-color,border-color,box-shadow] duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-primary/8 shadow-[0_0_0_1px_rgba(22,101,52,0.12)]"
          : "border-border bg-card hover:border-primary/35 hover:bg-muted/50",
      )}
    >
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-150",
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
