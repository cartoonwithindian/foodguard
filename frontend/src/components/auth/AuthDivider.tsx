import { cn } from "@/lib/utils";

type AuthDividerProps = {
  text: string;
  className?: string;
};

export function AuthDivider({ text, className }: AuthDividerProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {text}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
