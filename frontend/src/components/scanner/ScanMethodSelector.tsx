import { cn } from "@/lib/utils";

type ScanMethodSelectorProps = {
  barcodeLabel: string;
  ingredientsLabel: string;
  activeMethod: "barcode" | "ingredients";
  onMethodChange: (method: "barcode" | "ingredients") => void;
};

export function ScanMethodSelector({
  barcodeLabel,
  ingredientsLabel,
  activeMethod,
  onMethodChange,
}: ScanMethodSelectorProps) {
  return (
    <div className="flex rounded-xl border border-border bg-muted/30 p-1">
      <button
        type="button"
        onClick={() => onMethodChange("barcode")}
        className={cn(
          "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          activeMethod === "barcode"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {barcodeLabel}
      </button>
      <button
        type="button"
        onClick={() => onMethodChange("ingredients")}
        className={cn(
          "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          activeMethod === "ingredients"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {ingredientsLabel}
      </button>
    </div>
  );
}
