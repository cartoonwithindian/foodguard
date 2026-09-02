export function Disclaimer({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
      <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}
