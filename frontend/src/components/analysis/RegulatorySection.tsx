"use client";

import { useState } from "react";
import {
  Shield,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  Info,
  FileText,
  Beaker,
  Tag,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FSSAIAnalysisResult } from "@/services/regulatory/fssai";

// ── Types ──────────────────────────────────────────────────────────

type RegulatorySectionProps = {
  title: string;
  labels: {
    overallStatus: string;
    additives: string;
    labelling: string;
    claims: string;
    contaminants: string;
    packaging: string;
    viewSource: string;
    regulation: string;
    section: string;
    table: string;
    document: string;
    permitted: string;
    conditions: string;
    maximumLevel: string;
    unit: string;
    noData: string;
    referenceLimit: string;
    needsReview: string;
  };
  regulatory: FSSAIAnalysisResult;
};

// ── Status helpers ─────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { icon: typeof CheckCircle2; color: string; bg: string; border: string; label: string }
> = {
  PASS: {
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/40",
    border: "border-green-200 dark:border-green-900/50",
    label: "Reviewed",
  },
  REVIEW: {
    icon: AlertCircle,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-900/50",
    label: "Review",
  },
  NEEDS_REVIEW: {
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-900/50",
    label: "Needs Review",
  },
  INSUFFICIENT_DATA: {
    icon: HelpCircle,
    color: "text-gray-500 dark:text-gray-400",
    bg: "bg-gray-50 dark:bg-gray-900/40",
    border: "border-gray-200 dark:border-gray-800",
    label: "Insufficient Data",
  },
  NOT_APPLICABLE: {
    icon: Info,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-200 dark:border-blue-900/50",
    label: "Not Applicable",
  },
};

const CHECK_STATUS_CONFIG: Record<
  string,
  { icon: typeof CheckCircle2; color: string; label: string }
> = {
  PASS: { icon: CheckCircle2, color: "text-green-600 dark:text-green-400", label: "Reviewed" },
  PARTIAL: { icon: AlertCircle, color: "text-amber-600 dark:text-amber-400", label: "Partial" },
  FAIL: { icon: AlertTriangle, color: "text-red-600 dark:text-red-400", label: "Attention" },
  INSUFFICIENT_DATA: { icon: HelpCircle, color: "text-gray-500 dark:text-gray-400", label: "Insufficient Data" },
  FOUND: { icon: CheckCircle2, color: "text-green-600 dark:text-green-400", label: "Found" },
  NOT_FOUND: { icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", label: "Not Found" },
  UNCLEAR: { icon: HelpCircle, color: "text-gray-500 dark:text-gray-400", label: "Unclear" },
  NOT_APPLICABLE: { icon: Info, color: "text-blue-600 dark:text-blue-400", label: "N/A" },
};

const ADDITIVE_STATUS_CONFIG: Record<
  string,
  { color: string; bg: string; label: string }
> = {
  PERMITTED: { color: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/40", label: "Permitted" },
  PERMITTED_WITH_CONDITIONS: { color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40", label: "Permitted with conditions" },
  RESTRICTED: { color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/40", label: "Restricted" },
  NOT_PERMITTED: { color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/40", label: "Not permitted" },
  NOT_SPECIFIED: { color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-50 dark:bg-gray-900/40", label: "Not specified" },
  UNCLEAR: { color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-50 dark:bg-gray-900/40", label: "Unclear" },
};

// User-facing additive verdicts — never stronger than the available evidence.
const ADDITIVE_USER_STATUS_CONFIG: Record<
  string,
  { color: string; bg: string; label: string }
> = {
  PASS: { color: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/40", label: "Permitted for this category" },
  REVIEW: { color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40", label: "Review needed" },
  INSUFFICIENT_DATA: { color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-50 dark:bg-gray-900/40", label: "Insufficient data" },
  NO_DATA: { color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-50 dark:bg-gray-900/40", label: "No data" },
};

// Human-readable labels for the regulatory check summary values.
const CHECK_SUMMARY_LABELS: Record<string, string> = {
  PASS: "Reviewed",
  REVIEW: "Review",
  NEEDS_REVIEW: "Needs review",
  INSUFFICIENT_DATA: "Insufficient data",
  NO_DATA: "No data",
  REFERENCE_LIMIT_AVAILABLE: "Reference limits only",
  REFERENCE_DATA_AVAILABLE: "Reference data available",
};

function StatusBadge({ config }: { config: { color: string; bg: string; label: string } }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", config.bg, config.color)}>
      {config.label}
    </span>
  );
}

// ── Source traceability ────────────────────────────────────────────

function SourceReference({ sources, labels }: { sources: Array<{ regulation?: string; section?: string; table?: string; documentId?: string; documentType?: string }>; labels: RegulatorySectionProps["labels"] }) {
  const [isOpen, setIsOpen] = useState(false);
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <FileText className="size-3" aria-hidden="true" />
        {labels.viewSource}
        <ChevronDown className={cn("size-3 transition-transform", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="mt-2 rounded-lg border border-border bg-background p-3 text-xs space-y-1">
          {sources.map((src, i) => (
            <div key={i} className="flex flex-wrap gap-x-3 gap-y-0.5">
              {src.documentId && <span className="text-muted-foreground">{labels.document}: <span className="text-foreground">{src.documentId}</span></span>}
              {src.regulation && <span className="text-muted-foreground">{labels.regulation}: <span className="text-foreground">{src.regulation}</span></span>}
              {src.section && <span className="text-muted-foreground">{labels.section}: <span className="text-foreground">{src.section}</span></span>}
              {src.table && <span className="text-muted-foreground">{labels.table}: <span className="text-foreground">{src.table}</span></span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Additive card ──────────────────────────────────────────────────

function AdditiveCard({ additive, labels }: { additive: FSSAIAnalysisResult["additives"][0]; labels: RegulatorySectionProps["labels"] }) {
  const [isOpen, setIsOpen] = useState(false);
  const userStatusStyle = ADDITIVE_USER_STATUS_CONFIG[additive.userStatus ?? ""] ?? null;
  const statusStyle = ADDITIVE_STATUS_CONFIG[additive.status] ?? ADDITIVE_STATUS_CONFIG.UNCLEAR;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-foreground truncate">{additive.additiveName}</span>
          {additive.insNumber && (
            <span className="shrink-0 text-xs text-muted-foreground">INS {additive.insNumber}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {userStatusStyle ? <StatusBadge config={userStatusStyle} /> : <StatusBadge config={statusStyle} />}
          <ChevronDown className={cn("size-4 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
        </div>
      </button>
      {isOpen && (
        <div className="border-t border-border px-4 py-3 text-sm space-y-2">
          {additive.explanation && (
            <p className="text-xs text-muted-foreground">{additive.explanation}</p>
          )}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">FSSAI status:</span>
            <StatusBadge config={statusStyle} />
          </div>
          {additive.foodCategory && (
            <div><span className="text-muted-foreground">Food category: </span><span className="text-foreground">{additive.foodCategory}</span></div>
          )}
          {additive.maximumLevel && (
            <div><span className="text-muted-foreground">{labels.maximumLevel}: </span><span className="text-foreground">{additive.maximumLevel} {additive.unit ?? ""}</span></div>
          )}
          {additive.conditions && (
            <div><span className="text-muted-foreground">{labels.conditions}: </span><span className="text-foreground">{additive.conditions}</span></div>
          )}
          {additive.restrictions && additive.restrictions.length > 0 && (
            <div><span className="text-muted-foreground">Restrictions: </span><span className="text-foreground">{additive.restrictions.join(", ")}</span></div>
          )}
          {additive.needsReview && (
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <AlertCircle className="size-3" aria-hidden="true" />
              {labels.needsReview}
            </div>
          )}
          <SourceReference sources={additive.sourceReferences ?? (additive.source ? [additive.source] : [])} labels={labels} />
        </div>
      )}
    </div>
  );
}

// ── Contaminant card ───────────────────────────────────────────────

function ContaminantCard({ contaminant, labels }: { contaminant: FSSAIAnalysisResult["contaminants"][0]; labels: RegulatorySectionProps["labels"] }) {
  const evidenceStatus = contaminant.evidenceStatus ?? "NO_DATA";

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-foreground">{contaminant.substance}</span>
        <span className="text-xs text-muted-foreground">{contaminant.substanceType}</span>
      </div>
      {contaminant.maximumLimit && (
        <div>
          <span className="text-muted-foreground">Reference limit: </span>
          <span className="text-foreground">{contaminant.maximumLimit} {contaminant.unit ?? ""}</span>
        </div>
      )}
      <div className="text-xs text-muted-foreground">
        {evidenceStatus === "REFERENCE_LIMIT_AVAILABLE" && (
          <span className="flex items-center gap-1">
            <Info className="size-3" aria-hidden="true" />
            {labels.referenceLimit}
          </span>
        )}
        {evidenceStatus === "NO_DATA" && (
          <span className="flex items-center gap-1">
            <HelpCircle className="size-3" aria-hidden="true" />
            {labels.noData}
          </span>
        )}
        {evidenceStatus === "PRODUCT_TEST_RESULT_AVAILABLE" && contaminant.measuredValue && (
          <span className="flex items-center gap-1">
            <Beaker className="size-3" aria-hidden="true" />
            Measured: {contaminant.measuredValue} {contaminant.unit ?? ""}
          </span>
        )}
      </div>
      {contaminant.foodCategory && (
        <div className="text-xs text-muted-foreground">Applicable to: {contaminant.foodCategory}</div>
      )}
      <SourceReference sources={contaminant.sourceReferences} labels={labels} />
    </div>
  );
}

// ── Labelling check item ───────────────────────────────────────────

function LabellingCheck({ check }: { check: FSSAIAnalysisResult["labelling"]["checks"][0] }) {
  const statusConfig = CHECK_STATUS_CONFIG[check.status] ?? CHECK_STATUS_CONFIG.UNCLEAR;
  const Icon = statusConfig.icon;

  return (
    <div className="flex items-start gap-2 py-1.5">
      <Icon className={cn("size-4 mt-0.5 shrink-0", statusConfig.color)} aria-hidden="true" />
      <div className="min-w-0">
        <span className="text-sm text-foreground">{check.element}</span>
        {check.requirement && (
          <span className="text-xs text-muted-foreground ml-1">— {check.requirement}</span>
        )}
      </div>
    </div>
  );
}

// ── Claim card ─────────────────────────────────────────────────────

function ClaimCard({ claim, labels }: { claim: FSSAIAnalysisResult["claims"][0]; labels: RegulatorySectionProps["labels"] }) {
  const statusConfig = CHECK_STATUS_CONFIG[claim.status] ?? CHECK_STATUS_CONFIG.UNCLEAR;
  const Icon = statusConfig.icon;

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm space-y-1">
      <div className="flex items-center gap-2">
        <Icon className={cn("size-4 shrink-0", statusConfig.color)} aria-hidden="true" />
        <span className="font-medium text-foreground">{claim.claim}</span>
      </div>
      {claim.conditions.length > 0 && (
        <div className="text-xs text-muted-foreground">Conditions: {claim.conditions.join("; ")}</div>
      )}
      <SourceReference sources={claim.sourceReferences} labels={labels} />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────

export function RegulatorySection({ title, labels, regulatory }: RegulatorySectionProps) {
  const [showAdditives, setShowAdditives] = useState(true);
  const [showLabelling, setShowLabelling] = useState(false);
  const [showContaminants, setShowContaminants] = useState(false);
  const [showClaims, setShowClaims] = useState(false);

  if (!regulatory) return null;

  const overallConfig = STATUS_CONFIG[regulatory.overallStatus] ?? STATUS_CONFIG.INSUFFICIENT_DATA;
  const OverallIcon = overallConfig.icon;

  const additiveCount = regulatory.additives?.length ?? 0;
  const labellingChecks = regulatory.labelling?.checks?.length ?? 0;
  const contaminantCount = regulatory.contaminants?.length ?? 0;
  const claimCount = regulatory.claims?.length ?? 0;
  const additiveDetails = regulatory.regulatoryCheckDetails?.additives;
  const labellingDetails = regulatory.regulatoryCheckDetails?.labelling;
  const contaminantDetails = regulatory.regulatoryCheckDetails?.contaminants;

  const overallReason =
    regulatory.overallStatus === "REVIEW"
      ? "No definite findings were identified, but not all regulatory aspects could be verified against the available product data."
      : regulatory.overallStatus === "INSUFFICIENT_DATA"
        ? "Not enough product-specific data was available to complete the regulatory review."
        : regulatory.overallStatus === "NEEDS_REVIEW"
          ? "One or more findings require attention — see the check details below."
          : "Based on available product information and FSSAI regulatory data.";

  const summaryLabel = (value: string | undefined) =>
    value ? (CHECK_SUMMARY_LABELS[value] ?? value) : undefined;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Shield className="size-5 text-primary" aria-hidden="true" />
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      </div>

      {/* Overall status */}
      <div className={cn("flex items-center gap-3 rounded-xl border p-4", overallConfig.bg, overallConfig.border)}>
        <OverallIcon className={cn("size-5 shrink-0", overallConfig.color)} aria-hidden="true" />
        <div>
          <div className={cn("text-sm font-semibold", overallConfig.color)}>{overallConfig.label}</div>
          <p className="text-xs text-muted-foreground mt-0.5">{overallReason}</p>
        </div>
      </div>

      {/* Confidence */}
      {regulatory.confidence > 0 && (
        <div className="text-xs text-muted-foreground">
          Analysis confidence: {regulatory.confidence >= 0.8 ? "High" : regulatory.confidence >= 0.5 ? "Medium" : "Low"}
        </div>
      )}

      {/* Regulatory check summary */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {regulatory.regulatoryChecks.additives && (
          <div className="flex items-center gap-1.5">
            <Tag className="size-3 text-muted-foreground" aria-hidden="true" />
            <span className="text-muted-foreground">Additives:</span>
            <span className="text-foreground font-medium">{summaryLabel(regulatory.regulatoryChecks.additives)}</span>
          </div>
        )}
        {regulatory.regulatoryChecks.labelling && (
          <div className="flex items-center gap-1.5">
            <FileText className="size-3 text-muted-foreground" aria-hidden="true" />
            <span className="text-muted-foreground">Labelling:</span>
            <span className="text-foreground font-medium">{summaryLabel(regulatory.regulatoryChecks.labelling)}</span>
          </div>
        )}
        {regulatory.regulatoryChecks.claims && (
          <div className="flex items-center gap-1.5">
            <Leaf className="size-3 text-muted-foreground" aria-hidden="true" />
            <span className="text-muted-foreground">Claims:</span>
            <span className="text-foreground font-medium">{summaryLabel(regulatory.regulatoryChecks.claims)}</span>
          </div>
        )}
        {regulatory.regulatoryChecks.contaminants && (
          <div className="flex items-center gap-1.5">
            <Beaker className="size-3 text-muted-foreground" aria-hidden="true" />
            <span className="text-muted-foreground">Contaminants:</span>
            <span className="text-foreground font-medium">{summaryLabel(regulatory.regulatoryChecks.contaminants)}</span>
          </div>
        )}
      </div>

      {/* Additives section */}
      {additiveCount > 0 && (
        <div className="border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setShowAdditives(!showAdditives)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <Tag className="size-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium text-foreground">{labels.additives} ({additiveCount})</span>
            </div>
            <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", showAdditives && "rotate-180")} />
          </button>
          {showAdditives && (
            <div className="mt-2 space-y-2">
              {additiveDetails?.reason && (
                <p className="text-xs text-muted-foreground">{additiveDetails.reason}</p>
              )}
              {regulatory.additives.map((additive, i) => (
                <AdditiveCard key={i} additive={additive} labels={labels} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Labelling section */}
      {labellingChecks > 0 && (
        <div className="border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setShowLabelling(!showLabelling)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium text-foreground">{labels.labelling}</span>
            </div>
            <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", showLabelling && "rotate-180")} />
          </button>
          {showLabelling && (
            <div className="mt-2 space-y-2">
              {labellingDetails && (
                <p className="text-xs text-muted-foreground">
                  Checks performed: {labellingDetails.checksPerformed} · Potential issues detected: {labellingDetails.findings.length}
                </p>
              )}
              {labellingDetails?.reason && (
                <p className="text-xs text-muted-foreground">{labellingDetails.reason}</p>
              )}
              <div className="space-y-0.5">
              {regulatory.labelling.checks.map((check, i) => (
                <LabellingCheck key={i} check={check} />
              ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contaminants section */}
      {contaminantCount > 0 && (
        <div className="border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setShowContaminants(!showContaminants)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <Beaker className="size-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium text-foreground">{labels.contaminants}</span>
            </div>
            <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", showContaminants && "rotate-180")} />
          </button>
          {showContaminants && (
            <div className="mt-2 space-y-2">
              {contaminantDetails && (
                <p className="text-xs text-muted-foreground">
                  {contaminantDetails.findings.length > 0
                    ? `Product-specific findings detected: ${contaminantDetails.findings.length}`
                    : `No product-specific contaminant finding detected. Reference data available: ${contaminantDetails.referenceCount} rules.`}
                </p>
              )}
              {contaminantDetails?.reason && (
                <p className="text-xs text-muted-foreground">{contaminantDetails.reason}</p>
              )}
              {regulatory.contaminants.map((contaminant, i) => (
                <ContaminantCard key={i} contaminant={contaminant} labels={labels} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Claims section */}
      {claimCount > 0 && (
        <div className="border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setShowClaims(!showClaims)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <Leaf className="size-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium text-foreground">{labels.claims} ({claimCount})</span>
            </div>
            <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", showClaims && "rotate-180")} />
          </button>
          {showClaims && (
            <div className="mt-2 space-y-2">
              {regulatory.claims.map((claim, i) => (
                <ClaimCard key={i} claim={claim} labels={labels} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      {regulatory.disclaimer && (
        <p className="text-xs text-muted-foreground italic border-t border-border pt-3">
          {regulatory.disclaimer}
        </p>
      )}
    </div>
  );
}
