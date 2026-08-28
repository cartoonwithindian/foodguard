"use client";

import Link from "next/link";
import { ExternalLink, FileText, ScanLine, Search, ShieldAlert } from "lucide-react";
import type { ChatAction } from "@/types/chat";

function hrefFor(action: ChatAction): string {
  switch (action.type) {
    case "view_product":
    case "view_analysis":
      return `/analysis?barcode=${encodeURIComponent(action.payload.product_id)}`;
    case "generate_report":
      return action.payload.product_id
        ? `/food-safety-assistant?barcode=${encodeURIComponent(action.payload.product_id)}`
        : "/food-safety-assistant";
    case "view_regulation":
      return action.payload.url;
    case "scan_another":
      return "/scan";
  }
}

function iconFor(action: ChatAction) {
  switch (action.type) {
    case "view_product":
      return <Search className="h-4 w-4" />;
    case "view_analysis":
      return <ShieldAlert className="h-4 w-4" />;
    case "generate_report":
      return <FileText className="h-4 w-4" />;
    case "view_regulation":
      return <ExternalLink className="h-4 w-4" />;
    case "scan_another":
      return <ScanLine className="h-4 w-4" />;
  }
}

export function ActionButtons({ actions }: { actions: ChatAction[] }) {
  return (
    <div className="flex max-w-[92%] flex-wrap gap-2">
      {actions.map((action, index) =>
        action.type === "view_regulation" ? (
          <a
            key={`${action.type}-${index}`}
            href={action.payload.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
            data-testid={`chat-action-${index}`}
          >
            {iconFor(action)}
            {action.label}
          </a>
        ) : (
          <Link
            key={`${action.type}-${index}`}
            href={hrefFor(action)}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
            data-testid={`chat-action-${index}`}
          >
            {iconFor(action)}
            {action.label}
          </Link>
        ),
      )}
    </div>
  );
}