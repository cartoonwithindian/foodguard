import { getStore } from "@/lib/store";
import { SqliteStore, classifyCatalogCategory, normalizeProductImageUrl } from "@/lib/store/sqlite";
import type { CatalogFilterInput, CatalogPageResult, CatalogProductItem, DbHealthReport } from "@/lib/store/sqlite";
import { logger } from "@/lib/logger";

/**
 * Catalog browsing over the real FoodGuard product data.
 *
 * Primary path: the bundled SQLite database (SqliteStore) — fully server-side
 * paging, sorting, category counts and health metrics in SQL, so no page ever
 * ships the whole database to the browser.
 *
 * Secondary path: any other active store (in-memory demo, production Prisma).
 * The catalog degrades to that store's existing `searchProducts` result and
 * pages it in-process. Same shape, same UI, no fake products either way.
 */
export async function listCatalog(input: CatalogFilterInput = {}): Promise<CatalogPageResult> {
  const store = getStore();
  logger.debug("catalog_list_started", {
    search: input.search ?? "",
    category: input.category ?? "all",
    sort: input.sort ?? "new",
    offset: input.offset ?? 0,
    limit: input.limit ?? 24,
    store: store.constructor.name,
  });
  if (store instanceof SqliteStore) {
    const data = await store.listCatalog({
      search: input.search,
      category: input.category,
      sort: input.sort,
      offset: input.offset,
      limit: input.limit,
    });
    logger.debug("catalog_list_completed", {
      search: input.search ?? "",
      dbTotal: data.dbTotal,
      total: data.total,
      returned: data.products.length,
      withImage: data.products.filter((p) => p.imageUrl).length,
    });
    return data;
  }

  const limit = Math.min(Math.max(input.limit ?? 24, 1), 50);
  const offset = Math.max(input.offset ?? 0, 0);
  const hits = await store.searchProducts(input.search ?? "", "all");
  const items: CatalogProductItem[] = hits.map(({ product }) => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    barcode: product.barcode,
    category: classifyCatalogCategory(product.name),
    categoryLabel: product.category,
    imageUrl: normalizeProductImageUrl(product.imageUrl),
    packSize: null,
    price: null,
    source: product.source,
    cardCreatedAt: null,
    verified: product.verified,
    confidence: product.productDataConfidence,
    hasNutrition: false,
    hasIngredients: product.ingredientsRaw.length > 0,
    hasBarcode: product.barcode.length > 0,
  }));

  const categories = new Map<string, { key: string; label: string; count: number }>();
  for (const item of items) {
    const current = categories.get(item.category) ?? {
      key: item.category,
      label: item.category === "other" ? "Other" : item.category,
      count: 0,
    };
    current.count += 1;
    categories.set(item.category, current);
  }

  return {
    products: items.slice(offset, offset + limit),
    total: items.length,
    dbTotal: items.length,
    categories: Array.from(categories.values()).sort((a, b) => b.count - a.count),
  };
}

export async function dbHealthReport(): Promise<DbHealthReport | null> {
  const store = getStore();
  if (store instanceof SqliteStore) return store.dbHealth();
  return null;
}