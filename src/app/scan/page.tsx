import { AuthGuard } from "@/components/AuthGuard";
import { ScannerPage } from "@/components/scanner/ScannerPage";

type PageProps = {
  searchParams: Promise<{ mode?: string; open?: string; lang?: string }>;
};

export default async function ScanRoute({ searchParams }: PageProps) {
  const { mode, open, lang } = await searchParams;
  // Deep link from dashboard/history/nutrition: /scan?open=camera&mode=barcode
  const initialScreen =
    open === "camera" && mode === "barcode" ? "barcode" : ("identify" as const);
  return (
    <AuthGuard>
      <ScannerPage initialScreen={initialScreen} lang={lang} />
    </AuthGuard>
  );
}
