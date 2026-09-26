import { Info } from "lucide-react";

type TrustFooterProps = {
  message: string;
};

export function TrustFooter({ message }: TrustFooterProps) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card/50 px-4 py-3">
      <Info className="size-3.5 shrink-0 text-muted-foreground/60" aria-hidden="true" />
      <p className="text-xs text-muted-foreground/70">{message}</p>
    </div>
  );
}
