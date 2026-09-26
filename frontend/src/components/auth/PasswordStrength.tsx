import type { PasswordStrength } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { STRENGTH_CONFIG } from "@/data/password-strength";

type PasswordStrengthProps = {
  strength: PasswordStrength;
  label: string;
};

export function PasswordStrengthIndicator({
  strength,
  label,
}: PasswordStrengthProps) {
  if (strength === "none") return null;

  const config = STRENGTH_CONFIG[strength];

  return (
    <div className="flex items-center gap-2.5" role="status" aria-live="polite">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-300", config.barColor)}
          style={{ width: config.width }}
        />
      </div>
      <span className={cn("text-xs font-medium", config.color)}>{label}</span>
    </div>
  );
}
