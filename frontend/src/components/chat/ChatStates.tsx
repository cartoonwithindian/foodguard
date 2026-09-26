"use client";

import { Bot, Sparkles } from "lucide-react";

export function EmptyState({ hasProduct }: { hasProduct: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Bot className="h-7 w-7" />
      </div>
      <h2 className="text-lg font-semibold">FoodGuard AI Assistant</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        {hasProduct
          ? "Ask about this product's ingredients, why it has its concern level, or how to report it."
          : "Ask about ingredients, FSSAI labelling rules, additives, or your recent scans."}
      </p>
      <ul className="flex max-w-sm flex-col gap-1.5 text-left text-sm text-muted-foreground">
        <li className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          Product-grounded answers with sources
        </li>
        <li className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          FSSAI knowledge base for regulations
        </li>
        <li className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          Drafts a report — never files it for you
        </li>
      </ul>
    </div>
  );
}

export function Typing() {
  return (
    <div className="flex items-center gap-2" aria-label="FoodGuard AI is typing" data-testid="chat-typing">
      <div className="flex gap-1">
        <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/60" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
      </div>
      <span className="text-xs text-muted-foreground">FoodGuard AI is thinking…</span>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive"
      data-testid="chat-error"
    >
      {message}
    </div>
  );
}