"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import type { ComplaintDraft } from "@/types/food-safety-assistant";

export type ComplaintReviewProps = {
  draft: ComplaintDraft;
  draftText: string;
  onEdit: (text: string) => void;
};

export function ComplaintReview({ draft, draftText, onEdit }: ComplaintReviewProps) {
  const [edited, setEdited] = useState<string>(draftText);
  // Sync edits upward so the parent can include them in any future
  // regenerate pass. Local edits made by the user are kept verbatim.
  const lastEmitted = useRef<string>(draftText);
  useEffect(() => {
    if (edited === lastEmitted.current) {
      setEdited(draftText);
      lastEmitted.current = draftText;
    }
  }, [draftText, edited]);

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Draft complaint</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review the draft below. You can edit the text directly. Edits stay on your device until
            you regenerate.
          </p>
        </div>
        <Pencil className="size-4 text-muted-foreground" aria-hidden="true" />
      </div>

      <label className="sr-only" htmlFor="assistant-draft-textarea">
        Complaint draft
      </label>
      <textarea
        id="assistant-draft-textarea"
        value={edited}
        onChange={(e) => {
          setEdited(e.target.value);
          lastEmitted.current = e.target.value;
          onEdit(e.target.value);
        }}
        rows={18}
        className="mt-4 w-full resize-y rounded-xl border border-border bg-background p-3 font-mono text-xs leading-relaxed text-foreground focus:border-primary/40 focus:outline-none"
        data-testid="assistant-draft"
      />

      <p className="mt-3 text-xs text-muted-foreground">
        Subject: <span className="font-medium text-foreground">{draft.subjectLine}</span>
      </p>
    </section>
  );
}
