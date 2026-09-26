"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, Upload, Clipboard, X, Check, RefreshCw, AlertCircle, Edit3 } from "lucide-react";
import { ScannerViewport } from "./ScannerViewport";
import { validateImageFile } from "@/lib/image/validation";
import { parseIngredientText } from "@/lib/ingredients/parse";
import { logger } from "@/lib/logger";
import { useAuth } from "@/components/AuthProvider";
import { firebaseUploadScanImage } from "@/lib/firebase/storage";
import { apiUrl } from "@/lib/network/api-url";

type IngredientScannerProps = {
  cameraTitle: string;
  cameraDescription: string;
  takePhotoLabel: string;
  uploadLabel: string;
  pasteLabel: string;
  pastePlaceholder: string;
  analyzeLabel: string;
  onAnalyze: (text: string, barcode?: string, imageUrl?: string) => void;
};

export function IngredientScanner({
  cameraTitle,
  cameraDescription,
  takePhotoLabel,
  uploadLabel,
  pasteLabel,
  pastePlaceholder,
  analyzeLabel,
  onAnalyze,
}: IngredientScannerProps) {
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [showCamera, setShowCamera] = useState(false);

  // Upload/Captured Image States
  const [imageFile, setImageFile] = useState<File | Blob | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Processing & Review States
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>("");
  const [progressValue, setProgressValue] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { firebaseMode, firebaseUser } = useAuth();

  // Extracted Results for Editing
  const [extractedRawText, setExtractedRawText] = useState<string | null>(null);
  const [editedText, setEditedText] = useState<string>("");
  const [detectedBarcode, setDetectedBarcode] = useState<string | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setImageFile(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
    setIsProcessing(false);
    setProgressStatus("");
    setProgressValue(0);
    setErrorMsg(null);
    setExtractedRawText(null);
    setEditedText("");
    setDetectedBarcode(undefined);
  }, [imagePreviewUrl]);

  // Execute full OCR and Barcode recognition pipeline via the server route.
  // Server-side OCR uses the configured free API (OCR.space) with a local
  // fallback, so the phone never downloads a heavy OCR model.
  const processImageFile = async (file: File | Blob) => {
    setErrorMsg(null);
    setIsProcessing(true);
    setProgressStatus("Uploading image");
    setProgressValue(0.15);

    try {
      const form = new FormData();
      const blob = file instanceof Blob ? file : new Blob([file], { type: "image/jpeg" });
      const ext = blob.type.includes("png")
        ? "png"
        : blob.type.includes("webp")
          ? "webp"
          : blob.type.includes("heic") || blob.type.includes("heif")
            ? "heic"
            : "jpg";
      form.append("image", blob, `label.${ext}`);
      form.append("detectBarcode", "true");

      const response = await fetch(apiUrl("/api/scan/label"), { method: "POST", body: form });
      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        const message =
          (payload?.error as string) ||
          "Failed to process image. Please try a clearer photo or enter the ingredients manually.";
        setErrorMsg(message);
        return;
      }

      const data = payload.data ?? payload;
      const foundBarcode = data.barcode?.value || undefined;
      setDetectedBarcode(foundBarcode);

      const rawText: string = data.ocr?.text ?? data.rawText ?? "";

      if (!rawText.trim()) {
        if (foundBarcode) {
          onAnalyze("", foundBarcode);
          return;
        }
        setErrorMsg(
          "No readable text or ingredient list could be found in the image. Please try a clearer photo or enter text manually."
        );
        return;
      }

      setProgressStatus("Extracting ingredients");
      setProgressValue(0.8);

      const parsed = parseIngredientText(rawText);
      const initialText = parsed.listText || rawText;

      setExtractedRawText(rawText);
      setEditedText(initialText);
      setProgressStatus("Complete");
      setProgressValue(1);
    } catch (err: unknown) {
      logger.error("ingredient_scan_failed", { error: String(err) });
      const msg = "Failed to process image for OCR. Please try again.";
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelection = (file: File) => {
    resetState();
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMsg(validation.error || "Invalid file");
      return;
    }

    const preview = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreviewUrl(preview);
    processImageFile(file);
  };

  const handleCapture = useCallback((dataUrl: string) => {
    setShowCamera(false);
    resetState();
    setImagePreviewUrl(dataUrl);

    // Convert dataURL to Blob
    fetch(dataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        setImageFile(blob);
        processImageFile(blob);
      });
  }, [resetState]);

  const handleFileUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
    e.target.value = "";
  };

  const handleConfirmAndAnalyze = async () => {
    const trimmed = editedText.trim();
    if (!trimmed) return;
    let imageUrl: string | undefined;
    if (firebaseMode && firebaseUser && imageFile) {
      try {
        imageUrl = (await firebaseUploadScanImage(firebaseUser.uid, imageFile)) ?? undefined;
      } catch {
        logger.warn("firebase_scan_image_upload_failed");
      }
    }
    onAnalyze(trimmed, detectedBarcode, imageUrl);
  };

  return (
    <div className="flex flex-col gap-5">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {errorMsg && (
        <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">{errorMsg}</p>
          </div>
        </div>
      )}

      {showCamera && !imagePreviewUrl && (
        <div className="flex flex-col gap-4">
          <ScannerViewport
            alignText={cameraDescription}
            scanningText="Capturing..."
            isScanning={false}
            showCamera={true}
            onCapture={handleCapture}
            captureLabel={takePhotoLabel}
          />
          <button
            type="button"
            onClick={() => setShowCamera(false)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <X className="size-4" aria-hidden="true" />
            Cancel
          </button>
        </div>
      )}

      {/* Uploaded / Captured Image Preview & Pipeline State */}
      {imagePreviewUrl && (
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="relative rounded-xl overflow-hidden bg-black max-h-72 flex items-center justify-center">
            
            <img
              src={imagePreviewUrl}
              alt="Ingredient label preview"
              className="w-full h-auto max-h-72 object-contain"
            />
          </div>

          {/* Processing Progress Overlay */}
          {isProcessing && (
            <div className="flex flex-col gap-2 p-3 bg-muted/50 rounded-xl">
              <div className="flex items-center justify-between text-xs font-medium text-foreground">
                <span className="flex items-center gap-2">
                  <RefreshCw className="size-3.5 animate-spin text-primary" />
                  {progressStatus || "Processing OCR..."}
                </span>
                <span>{Math.round(progressValue * 100)}%</span>
              </div>
              <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${Math.max(5, progressValue * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Extracted Ingredients Review & Edit Section */}
          {extractedRawText !== null && !isProcessing && (
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Edit3 className="size-3.5 text-primary" />
                  Extracted Ingredients (Review & Edit):
                </label>
                {detectedBarcode && (
                  <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-mono">
                    Barcode: {detectedBarcode}
                  </span>
                )}
              </div>
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={5}
                className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetState}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <X className="size-4" />
                  Retry / Remove
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAndAnalyze}
                  disabled={!editedText.trim()}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  <Check className="size-4" />
                  Analyze Ingredients
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!showCamera && !imagePreviewUrl && (
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="text-center">
            <h3 className="text-base font-semibold text-foreground">{cameraTitle}</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
              {cameraDescription}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setShowCamera(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Camera className="size-4" aria-hidden="true" />
              {takePhotoLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                handleFileUploadClick();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Upload className="size-4" aria-hidden="true" />
              {uploadLabel}
            </button>
          </div>
        </div>
      )}

      {!showCamera && !imagePreviewUrl && (
        <button
          type="button"
          onClick={() => setShowPaste(!showPaste)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Clipboard className="size-4" aria-hidden="true" />
          {pasteLabel}
        </button>
      )}

      {showPaste && !imagePreviewUrl && (
        <div className="flex flex-col gap-3">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={pastePlaceholder}
            rows={6}
            className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
          />
          <button
            type="button"
            onClick={() => {
              if (pasteText.trim()) onAnalyze(pasteText.trim());
            }}
            disabled={!pasteText.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          >
            {analyzeLabel}
          </button>
        </div>
      )}
    </div>
  );
}
