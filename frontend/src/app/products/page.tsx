import { AuthGuard } from "@/components/AuthGuard";
import { ProductCatalogPage } from "@/components/catalog/ProductCatalogPage";

type PageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    sort?: string;
  }>;
};

export default async function ProductsRoute({ searchParams }: PageProps) {
  const { search, category, sort } = await searchParams;
  return (
    <AuthGuard>
      <ProductCatalogPage search={search} category={category} sort={sort} />
    </AuthGuard>
  );
}