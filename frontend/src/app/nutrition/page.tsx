import { AuthGuard } from "@/components/AuthGuard";
import { NutritionPage } from "@/components/nutrition/NutritionPage";

type PageProps = {
  searchParams: Promise<{ barcode?: string; lang?: string }>;
};

export default async function NutritionRoute({ searchParams }: PageProps) {
  const { barcode, lang } = await searchParams;
  return (
    <AuthGuard>
      <NutritionPage barcode={barcode ?? ""} lang={lang} />
    </AuthGuard>
  );
}
