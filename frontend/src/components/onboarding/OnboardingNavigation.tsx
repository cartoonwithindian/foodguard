import { cn } from "@/lib/utils";

type OnboardingNavigationProps = {
  backLabel: string;
  continueLabel: string;
  skipLabel?: string;
  showBack: boolean;
  showSkip?: boolean;
  onBack: () => void;
  onContinue: () => void;
  onSkip?: () => void;
  continueDisabled?: boolean;
  isLast?: boolean;
  className?: string;
};

export function OnboardingNavigation({
  backLabel,
  continueLabel,
  skipLabel,
  showBack,
  showSkip,
  onBack,
  onContinue,
  onSkip,
  continueDisabled,
  isLast,
  className,
}: OnboardingNavigationProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {showSkip && skipLabel && onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="w-full text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {skipLabel}
        </button>
      )}
      <div className="flex gap-3">
        {showBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex h-12 flex-1 items-center justify-center rounded-xl border border-border bg-card text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {backLabel}
          </button>
        )}
        <button
          type="button"
          onClick={onContinue}
          disabled={continueDisabled}
          className={cn(
            "flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 active:bg-primary/95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            showBack ? "flex-[2]" : "w-full",
          )}
        >
          {continueLabel}
          {isLast && (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          )}
        </button>
      </div>
    </div>
  );
}
