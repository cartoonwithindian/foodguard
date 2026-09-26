"use client";

import { useState } from "react";
import { Search } from "lucide-react";

type ManualBarcodeInputProps = {
  label: string;
  placeholder: string;
  buttonLabel: string;
  onSubmit: (barcode: string) => void;
};

export function ManualBarcodeInput({
  label,
  placeholder,
  buttonLabel,
  onSubmit,
}: ManualBarcodeInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onSubmit(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
        >
          <Search className="size-4" aria-hidden="true" />
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
