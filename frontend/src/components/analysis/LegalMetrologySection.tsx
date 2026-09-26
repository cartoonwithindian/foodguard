"use client";

import { useState } from "react";
import type { LegalMetrologyResult, ComplianceStatus } from "@/services/regulatory/legal-metrology";

type LegalMetrologySectionProps = {
  result: LegalMetrologyResult | null;
};

const STATUS_CONFIG: Record<ComplianceStatus, { color: string; bg: string; icon: string; label: string }> = {
  COMPLIANT: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", icon: "✅", label: "Compliant" },
  NON_COMPLIANT: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", icon: "❌", label: "Non-Compliant" },
  REVIEW_REQUIRED: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", icon: "⚠️", label: "Review Required" },
  NOT_APPLICABLE: { color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/30", icon: "➖", label: "Not Applicable" },
};

function StatusBadge({ status }: { status: ComplianceStatus }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.REVIEW_REQUIRED;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${config.bg} ${config.color}`}>
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}

function CheckItem({ check }: { check: LegalMetrologyResult["checks"][0] }) {
  const resultColor = {
    PASS: "text-emerald-400",
    FAIL: "text-red-400",
    REVIEW: "text-amber-400",
    NOT_APPLICABLE: "text-slate-500",
    SKIPPED: "text-slate-500",
  }[check.result] || "text-slate-400";

  const resultIcon = {
    PASS: "✅",
    FAIL: "❌",
    REVIEW: "⚠️",
    NOT_APPLICABLE: "➖",
    SKIPPED: "⏭️",
  }[check.result] || "❓";

  return (
    <div className="flex items-start gap-3 py-2">
      <span className="mt-0.5 text-sm">{resultIcon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500">{check.rule}</span>
          <span className={`text-xs font-medium ${resultColor}`}>{check.result}</span>
        </div>
        <p className="text-sm text-slate-300 mt-0.5">{check.requirement}</p>
        {check.note && (
          <p className="text-xs text-slate-500 mt-1">{check.note}</p>
        )}
      </div>
    </div>
  );
}

function ViolationItem({ violation }: { violation: LegalMetrologyResult["violations"][0] }) {
  const severityColor = {
    HIGH: "text-red-400 bg-red-500/10",
    MEDIUM: "text-amber-400 bg-amber-500/10",
    LOW: "text-yellow-400 bg-yellow-500/10",
  }[violation.severity] || "text-slate-400 bg-slate-500/10";

  return (
    <div className="flex items-start gap-3 py-2 px-3 rounded-lg bg-red-500/5 border border-red-500/20">
      <span className="text-red-400 mt-0.5">🚨</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${severityColor}`}>{violation.severity}</span>
          <span className="text-xs font-mono text-slate-500">{violation.rule}</span>
        </div>
        <p className="text-sm text-slate-300 mt-1">{violation.message}</p>
        {violation.source_id && (
          <p className="text-xs text-slate-500 mt-1">Source: {violation.source_id}</p>
        )}
      </div>
    </div>
  );
}

function ReviewItem({ item }: { item: LegalMetrologyResult["review_items"][0] }) {
  return (
    <div className="flex items-start gap-3 py-2 px-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
      <span className="text-amber-400 mt-0.5">⚠️</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500">{item.code}</span>
          <span className="text-xs text-amber-400">{item.severity}</span>
        </div>
        <p className="text-sm text-slate-300 mt-1">{item.message}</p>
      </div>
    </div>
  );
}

export function LegalMetrologySection({ result }: LegalMetrologySectionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!result) return null;

  const passedChecks = result.checks.filter((c) => c.result === "PASS").length;
  const failedChecks = result.checks.filter((c) => c.result === "FAIL").length;
  const reviewChecks = result.checks.filter((c) => c.result === "REVIEW").length;
  const totalChecks = result.checks.length;

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-lg">
            🇮🇳
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Legal Metrology Check</h3>
            <p className="text-xs text-slate-400">Packaged Commodities Rules, 2011</p>
          </div>
        </div>
        <StatusBadge status={result.status} />
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="text-center p-2 rounded-lg bg-slate-700/30">
          <div className="text-lg font-bold text-white">{totalChecks}</div>
          <div className="text-xs text-slate-400">Total Checks</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-emerald-500/10">
          <div className="text-lg font-bold text-emerald-400">{passedChecks}</div>
          <div className="text-xs text-slate-400">Passed</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-red-500/10">
          <div className="text-lg font-bold text-red-400">{failedChecks}</div>
          <div className="text-xs text-slate-400">Failed</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-amber-500/10">
          <div className="text-lg font-bold text-amber-400">{reviewChecks}</div>
          <div className="text-xs text-slate-400">Review</div>
        </div>
      </div>

      {/* Product info */}
      {result.product && (
        <div className="mb-4 p-3 rounded-lg bg-slate-700/20 border border-slate-600/30">
          <div className="text-xs text-slate-400 mb-1">Detected Product Info</div>
          <div className="flex flex-wrap gap-4 text-sm">
            {result.product.product_name && (
              <span className="text-slate-300">{result.product.product_name}</span>
            )}
            {result.product.net_quantity && (
              <span className="text-slate-400">Net Qty: {result.product.net_quantity.value} {result.product.net_quantity.unit}</span>
            )}
            {result.product.mrp && (
              <span className="text-slate-400">MRP: ₹{result.product.mrp.value}</span>
            )}
          </div>
        </div>
      )}

      {/* Violations */}
      {result.violations.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-red-400 mb-2">Violations ({result.violations.length})</h4>
          <div className="space-y-2">
            {result.violations.map((v, i) => (
              <ViolationItem key={i} violation={v} />
            ))}
          </div>
        </div>
      )}

      {/* Review items */}
      {result.review_items.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-amber-400 mb-2">Review Items ({result.review_items.length})</h4>
          <div className="space-y-2">
            {result.review_items.map((item, i) => (
              <ReviewItem key={i} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Expandable checks */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left text-sm text-slate-400 hover:text-slate-300 transition-colors py-2 border-t border-slate-700/50 mt-2"
      >
        {expanded ? "▾ Hide" : "▸ Show"} all checks ({totalChecks})
      </button>

      {expanded && (
        <div className="mt-2 space-y-1 max-h-96 overflow-y-auto">
          {result.checks.map((check, i) => (
            <CheckItem key={i} check={check} />
          ))}
        </div>
      )}

      {/* Sources */}
      {result.sources.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-700/50">
          <h4 className="text-xs font-medium text-slate-500 mb-2">Legal Sources</h4>
          <div className="flex flex-wrap gap-2">
            {result.sources.map((src, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded bg-slate-700/30 text-slate-400">
                {src.source_id}: {src.title?.substring(0, 50)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-slate-600 mt-4 italic">{result.disclaimer}</p>
    </div>
  );
}
