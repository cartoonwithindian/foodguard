"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, Upload, AlertCircle, Barcode, RefreshCw, X } from "lucide-react";
import { ScannerViewport } from "./ScannerViewport";
import { ManualBarcodeInput } from "./ManualBarcodeInput";
import { validateImageFile } from "@/lib/image/validation";
import {
  resolveProductByPhotoLocalFirst,
  resolveProductByBarcode,
} from "@/lib/resolve-product";
import type { ExtractedInfo, ProductResolution } from "@/types/identification";

type ManualAddPanelProps = {
  title: string;
  takePhoto: string;
  uploadImage: string;
  processing: string;
  cancel: string;
  barcodeTitle: string;
  barcodePlaceholder: string;
  barcodeButton: string;
  onResult: (resolution: ProductResolution, extracted: ExtractedInfo, imageUrl?: string | null) => void;
};

export function ManualAddPanel({
  title,
  takePhoto,
  uploadImage,
  processing,
  cancel,
  barcodeTitle,
  barcodePlaceholder,
  barcodeButton,
  onResult,
}: ManualAddPanelProps) {
  const [mode, setMode] = useState<"photo" | "barcode">("photo");
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(
    async (file: File | Blob) => {
      setErrorMsg(null);
      setIsProcessing(true);
      setStatusText(processing);
      try {
        const { resolution, extracted } = await resolveProductByPhotoLocalFirst(
          file,
          (status) => setStatusText(status),
        );
        onResult(resolution, extracted);
      } catch {
        setErrorMsg("We couldn't read this photo. Try a clearer, well-lit image.");
      } finally {
        setIsProcessing(false);
        setStatusText("");
      }
    },
    [processing, onResult],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMsg(validation.error || "Invalid file");
      return;
    }
    void processImage(file);
  };

  const handleCapture = useCallback(
    (dataUrl: string) => {
      setShowCamera(false);
      fetch(dataUrl)
        .then((res) => res.blob())
        .then((blob) => processImage(blob))
        .catch(() => setErrorMsg("We couldn't read this photo. Try again."));
    },
    [processImage],
  );

  const handleBarcodeSubmit = useCallback(
    async (barcode: string) => {
      setErrorMsg(null);
      setIsProcessing(true);
      setStatusText(processing);
      try {
        const resolution = await resolveProductByBarcode(barcode, "manual_barcode");
        const extracted: ExtractedInfo = { barcode };
        onResult(resolution, extracted);
      } catch {
        setErrorMsg("We couldn't search for that barcode right now. Please try again.");
      } finally {
        setIsProcessing(false);
        setStatusText("");
      }
    },
    [processing, onResult],
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("photo")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "photo"
              ? "bg-primary text-primary-foreground shadow"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            <Camera className="size-4" aria-hidden="true" />
            {takePhoto}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMode("barcode")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "barcode"
              ? "bg-primary text-primary-foreground shadow"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            <Barcode className="size-4" aria-hidden="true" />
            {barcodeTitle}
          </span>
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <p className="font-medium">{errorMsg}</p>
        </div>
      )}

      {isProcessing && (
        <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <RefreshCw className="size-4 animate-spin text-primary" aria-hidden="true" />
          <span>{statusText}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
        className="hidden"
        onChange={handleFileSelect}
      />

      {mode === "photo" && !showCamera && (
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setShowCamera(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Camera className="size-4" aria-hidden="true" />
              {takePhoto}
            </button>
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                fileInputRef.current?.click();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Upload className="size-4" aria-hidden="true" />
              {uploadImage}
            </button>
          </div>
        </div>
      )}

      {mode === "photo" && showCamera && (
        <div className="flex flex-col gap-4">
          <ScannerViewport
            alignText={takePhoto}
            scanningText={processing}
            isScanning={isProcessing}
            showCamera={true}
            onCapture={handleCapture}
            captureLabel={takePhoto}
          />
          <button
            type="button"
            onClick={() => setShowCamera(false)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <X className="size-4" aria-hidden="true" />
            {cancel}
          </button>
        </div>
      )}

      {mode === "barcode" && (
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <ManualBarcodeInput
            label={barcodeTitle}
            placeholder={barcodePlaceholder}
            buttonLabel={barcodeButton}
            onSubmit={(value) => {
              void handleBarcodeSubmit(value);
            }}
          />
        </div>
      )}
    </div>
  );
}