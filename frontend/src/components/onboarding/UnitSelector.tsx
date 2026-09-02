import { cn } from "@/lib/utils";

type UnitOption = {
  value: string;
  label: string;
};

type UnitSelectorProps = {
  options: UnitOption[];
  selected: string;
  onChange: (value: string) => void;
};

export function UnitSelector({ options, selected, onChange }: UnitSelectorProps) {
  return (
    <div
      role="radiogroup"
      className="flex rounded-lg bg-muted p-0.5"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={selected === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            selected === opt.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
