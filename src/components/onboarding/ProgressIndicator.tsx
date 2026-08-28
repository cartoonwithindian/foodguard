import { cn } from "@/lib/utils";

type ProgressIndicatorProps = {
  currentStep: number;
  totalSteps: number;
  label: string;
};

export function ProgressIndicator({
  currentStep,
  totalSteps,
  label,
}: ProgressIndicatorProps) {
  return (
    <div className="w-full" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps} aria-label={label}>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isComplete = step < currentStep;
          const isCurrent = step === currentStep;
          return (
            <div
              key={step}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                isComplete
                  ? "bg-primary"
                  : isCurrent
                    ? "bg-primary/60"
                    : "bg-border",
              )}
            />
          );
        })}
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
