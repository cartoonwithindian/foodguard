import { AuthGuard } from "@/components/AuthGuard";
import { IngredientPage } from "@/components/ingredient/IngredientPage";

type PageProps = {
  searchParams: Promise<{ id?: string; product?: string; lang?: string }>;
};

export default async function IngredientRoute({ searchParams }: PageProps) {
  const { id, product, lang } = await searchParams;
  return (
    <AuthGuard>
      <IngredientPage ingredientId={id ?? ""} productBarcode={product} lang={lang} />
    </AuthGuard>
  );
}
