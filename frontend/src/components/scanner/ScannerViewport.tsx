"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ScanLine, VideoOff, Camera, RefreshCw } from "lucide-react";
import { getBarcodeReader } from "@/lib/barcode";

type ScannerViewportProps = {
  alignText: string;
  scanningText: string;
  isScanning?: boolean;
  showCamera: boolean;
  onCapture?: (imageData: string) => void;
  onBarcodeDetected?: (barcode: string) => void;
  captureLabel?: string;
};

/**
 * Debounce window for the same barcode value coming off the live ZXing
 * decode loop. Without this, a barcode visible for a fraction of a second
 * fires dozens of duplicate lookups before the parent has a chance to
 * navigate away.
 */
const BarcodeCooldownMs = 1800;

export function ScannerViewport({
  alignText,
  scanningText,
  isScanning = false,
  showCamera,
  onCapture,
  onBarcodeDetected,
  captureLabel = "Capture",
}: ScannerViewportProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const zxingControlsRef = useRef<{ stop: () => void } | null>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const cameraActiveRef = useRef(false);

  const lastDetectedRef = useRef<{ value: string; at: number } | null>(null);

  const [cameraState, setCameraState] = useState<
    "idle" | "loading" | "active" | "permission_denied" | "unsupported" | "error"
  >("idle");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Derive the displayed state: when the camera is hidden the state is idle.
  const visibleCameraState: typeof cameraState = !showCamera ? "idle" : cameraState;

  const stopCameraStream = useCallback(() => {
    // 0. Cancel any scheduled decode-loop resume
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    cameraActiveRef.current = false;

    // 1. Stop ZXing decoder first
    if (zxingControlsRef.current) {
      try {
        zxingControlsRef.current.stop();
        console.debug("[ScannerViewport] ZXing decoder stopped.");
      } catch (err) {
        console.warn("[ScannerViewport] Error stopping ZXing decoder:", err);
      }
      zxingControlsRef.current = null;
    }

    // 2. Stop all MediaStream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.debug(`[ScannerViewport] Track stopped: ${track.label}`);
      });
      streamRef.current = null;
    }

    // 3. Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Enumerate video input devices
  const loadDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = allDevices.filter((d) => d.kind === "videoinput");
      setDevices(videoInputs);
    } catch (err) {
      console.warn("[ScannerViewport] Error enumerating devices:", err);
    }
  }, []);

  const handleBarcodeRead = useCallback(
    (raw: string) => {
      if (!onBarcodeDetected) return;
      const value = raw.trim();
      if (!value) return;

      const now = Date.now();
      const last = lastDetectedRef.current;
      // Ignore repeats of the same barcode within the cooldown window so a
      // single scan produces exactly one resolution attempt.
      if (last && last.value === value && now - last.at < BarcodeCooldownMs) {
        return;
      }
      lastDetectedRef.current = { value, at: now };
      onBarcodeDetected(value);
    },
    [onBarcodeDetected],
  );

  const cycleCameraRetry = useCallback(() => {
    lastDetectedRef.current = null;
    setCameraState("loading");
    setRetryKey((k) => k + 1);
  }, []);

  // The <video> element is now mounted as soon as the camera is requested
  // (so the ref exists before getUserMedia resolves). As a safety net,
  // attach the stream again once the camera reaches the active state, in
  // case the element was (re)created after the stream was acquired.
  useEffect(() => {
    if (!showCamera || cameraState !== "active" || !streamRef.current) return;
    const video = videoRef.current;
    if (!video || video.srcObject === streamRef.current) return;
    video.srcObject = streamRef.current;
    video.play().catch((err) => {
      console.error("[ScannerViewport] Video play error:", err);
    });
  }, [showCamera, cameraState]);

  // Initialize camera and real ZXing decoding reader
  useEffect(() => {
    if (!showCamera) {
      stopCameraStream();
      return;
    }

    let isMounted = true;

    const initCameraAndDecoder = async () => {
      setCameraState("loading");
      stopCameraStream();

      // Browsers only expose getUserMedia on HTTPS (or localhost). On plain
      // HTTP (e.g. a LAN IP on a phone) navigator.mediaDevices is undefined.
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraState("unsupported");
        return;
      }

      try {
        const constraints: MediaStreamConstraints = {
          video: selectedDeviceId
            ? { deviceId: { exact: selectedDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
            : { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        await loadDevices();

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Wait for metadata to load before playing to avoid "play() interrupted" errors
          videoRef.current.onloadedmetadata = () => {
            if (isMounted && videoRef.current) {
              videoRef.current.play().catch((err) => {
                console.error("[ScannerViewport] Video play error:", err);
              });
            }
          };
        }

        if (!isMounted) return;
        setCameraState("active");
        cameraActiveRef.current = true;

        // Start ZXing real-time video decoder if onBarcodeDetected provided.
        // ZXing's decodeFromVideoElement only works once the <video> is
        // actually playing — starting it too early silently produces no
        // decodes (intermittent "scanning not working"). We wait for
        // playback before starting, and auto-resume the loop after each
        // successful read so consecutive scans keep working.
        if (onBarcodeDetected && videoRef.current) {
          try {
            const reader = await getBarcodeReader();
            if (!reader || !isMounted) return;

            const startDecoding = async () => {
              if (!isMounted || !cameraActiveRef.current || !videoRef.current) return;
              try {
                const controls = await reader.decodeFromVideoElement(
                  videoRef.current,
                  (result) => {
                    if (result && result.getText() && isMounted && cameraActiveRef.current) {
                      // Stop the loop so the user sees the frame freeze once,
                      // then resume after the cooldown window so scanning the
                      // next item works without reopening the camera.
                      zxingControlsRef.current?.stop();
                      zxingControlsRef.current = null;
                      handleBarcodeRead(result.getText());
                      resumeTimerRef.current = window.setTimeout(() => {
                        resumeTimerRef.current = null;
                        if (isMounted && cameraActiveRef.current) {
                          void startDecoding();
                        }
                      }, BarcodeCooldownMs + 500);
                    }
                  },
                );
                if (!isMounted) {
                  controls?.stop();
                  return;
                }
                zxingControlsRef.current = controls ?? null;
              } catch (zxingErr) {
                console.error("[ScannerViewport] ZXing decode loop error:", zxingErr);
              }
            };

            const video = videoRef.current;
            if (video.readyState >= 2 && !video.paused) {
              void startDecoding();
            } else {
              video.onplaying = () => {
                video.onplaying = null;
                void startDecoding();
              };
            }
          } catch (zxingErr) {
            console.error("[ScannerViewport] ZXing real-time video decode init error:", zxingErr);
          }
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const errName = (err as { name?: string })?.name || "";
        console.error("[ScannerViewport] Camera init error:", err);

        if (errName === "NotAllowedError" || errName === "PermissionDeniedError") {
          setCameraState("permission_denied");
        } else {
          setCameraState("error");
        }
      }
    };

    initCameraAndDecoder();

    return () => {
      isMounted = false;
      cameraActiveRef.current = false;
      if (resumeTimerRef.current !== null) {
        window.clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = null;
      }
      stopCameraStream();
    };
  }, [showCamera, selectedDeviceId, retryKey, handleBarcodeRead, stopCameraStream, loadDevices, onBarcodeDetected]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current || !onCapture) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Use actual video dimensions
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      onCapture(dataUrl);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-black aspect-[4/3] sm:aspect-[16/10]">
      <canvas ref={canvasRef} className="hidden" />

      {showCamera && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {showCamera && visibleCameraState === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="size-8 text-primary animate-spin" />
            <p className="text-sm text-white/70">Starting camera...</p>
          </div>
        </div>
      )}

      {showCamera && visibleCameraState === "permission_denied" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black p-4 text-center">
          <div className="flex flex-col items-center gap-3 max-w-xs">
            <VideoOff className="size-10 text-destructive" aria-hidden="true" />
            <p className="text-sm font-medium text-white">Camera Access Denied</p>
            <p className="text-xs text-white/60">
              Please grant camera permission in your browser settings to scan barcodes.
            </p>
            <button
              type="button"
              onClick={cycleCameraRetry}
              className="mt-2 text-xs text-primary underline underline-offset-4"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {showCamera && visibleCameraState === "unsupported" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black p-4 text-center">
          <div className="flex flex-col items-center gap-3 max-w-xs">
            <VideoOff className="size-10 text-white/40" aria-hidden="true" />
            <p className="text-sm font-medium text-white">Camera Unavailable on this Connection</p>
            <p className="text-xs text-white/60">
              Browsers block camera access over plain HTTP. Open the app over HTTPS or use the
              Upload / Take Photo buttons below, which work on any connection.
            </p>
          </div>
        </div>
      )}

      {showCamera && visibleCameraState === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black p-4 text-center">
          <div className="flex flex-col items-center gap-3 max-w-xs">
            <VideoOff className="size-10 text-white/40" aria-hidden="true" />
            <p className="text-sm text-white/70">Camera Unavailable</p>
            <p className="text-xs text-white/40">
              Could not access a video device. Try selecting another camera or uploading an image.
            </p>
            <button
              type="button"
              onClick={cycleCameraRetry}
              className="mt-2 text-xs text-primary underline underline-offset-4"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {!showCamera && (
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      )}

      {/* Frame overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-2/3 max-w-[240px] aspect-square">
          <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-primary/80 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-primary/80 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-primary/80 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-primary/80 rounded-br-lg" />
          {(isScanning || visibleCameraState === "active") && (
            <div className="absolute inset-x-2 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" />
          )}
          {!showCamera && !isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <ScanLine className="size-10 text-white/20" aria-hidden="true" />
            </div>
          )}
        </div>
      </div>

      {/* Top camera selection selector if multiple cameras exist */}
      {showCamera && visibleCameraState === "active" && devices.length > 1 && (
        <div className="absolute top-3 right-3 z-10">
          <select
            value={selectedDeviceId || ""}
            onChange={(e) => setSelectedDeviceId(e.target.value || null)}
            className="rounded-lg bg-black/60 px-2 py-1 text-xs text-white border border-white/20 focus:outline-none"
          >
            {devices.map((d, idx) => (
              <option key={d.deviceId || idx} value={d.deviceId}>
                {d.label || `Camera ${idx + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="flex items-center justify-center gap-2">
          {isScanning && <div className="size-2 rounded-full bg-primary animate-pulse" />}
          <p className="text-sm text-white/90 font-medium">
            {isScanning ? scanningText : alignText}
          </p>
        </div>
      </div>

      {showCamera && visibleCameraState === "active" && onCapture && (
        <div className="absolute bottom-14 inset-x-0 flex justify-center">
          <button
            type="button"
            onClick={handleCapture}
            className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-lg hover:bg-primary/90 transition-colors"
          >
            <Camera className="mr-1.5 inline size-4" aria-hidden="true" />
            {captureLabel}
          </button>
        </div>
      )}
    </div>
  );
}