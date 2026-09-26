import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { mkdtempSync, cpSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SqliteStore, hasSqliteDatabase, SQLITE_DB_PATH } from "@/lib/store/sqlite";
import type { ProductLookupResult } from "@/lib/product-provider";

const SOURCE_DB = join(process.cwd(), "data", "foodguard", "foodguard.db");

const skip = !existsSync(SOURCE_DB);

describe.skipIf(skip)("SqliteStore (bundled FoodGuard database)", () => {
  let tmpDir: string;
  let store: SqliteStore;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "foodguard-sqlite-"));
    cpSync(SOURCE_DB, join(tmpDir, "foodguard.db"));
    store = new SqliteStore(join(tmpDir, "foodguard.db"));
  });

  afterAll(() => {
    if (tmpDir) rmSync(tmpDir, { recursive: true, force: true });
  });

  it("detects the bundled database file", () => {
    expect(hasSqliteDatabase(SOURCE_DB)).toBe(true);
    expect(hasSqliteDatabase(join(tmpdir(), "does-not-exist.db"))).toBe(false);
    expect(SQLITE_DB_PATH.length).toBeGreaterThan(0);
  });

  it("finds a real product by barcode through the barcodes index", async () => {
    const product = await store.getProductByBarcode("8908003630052");
    expect(product).not.toBeNull();
    expect(product?.name).toContain("AJAY");
    expect(product?.barcode).toBe("8908003630052");
    expect(product?.source).toBe("saisupermarket");
    expect(product?.category).toBe("food");
  });

  it("finds a product by its FG_ id", async () => {
    const product = await store.getProductById("FG_DBF242");
    expect(product).not.toBeNull();
    expect(product?.barcode).toBe("8908003630052");
  });

  it("parses the raw label nutrition blob into NutritionFacts", async () => {
    const p = await store.getProductByBarcode("8901063142893"); // BRI.N/C OATS BISCUIT
    expect(p).not.toBeNull();
    if (!p) return;
    const nutrition = await store.getNutritionForProduct(p.id);
    expect(nutrition).not.toBeNull();
    expect(nutrition?.basis).toBe("PER_100G");
    expect(nutrition?.nutrients.calories?.value).toBeGreaterThan(0);
    expect(nutrition?.nutrients.protein?.value).toBeGreaterThan(0);
    expect(nutrition?.nutrients.totalFat).toBeDefined();
  });

  it("never invents data for an unknown barcode and falls back to seed products", async () => {
    expect(await store.getProductByBarcode("9999999999999")).toBeNull();
    const seed = await store.getProductByBarcode("8901000000001"); // bundled demo seed
    expect(seed).not.toBeNull();
    expect(seed?.isDemo).toBe(true);
  });

  it("searches products by name/brand/barcode", async () => {
    const byName = await store.searchProducts("amul");
    expect(byName.length).toBeGreaterThan(0);
    expect(byName[0]!.rank).toBeGreaterThan(0);
    expect(byName[0]!.product.name).toContain("AMUL");

    const byBarcode = await store.searchProducts("8908003630052");
    expect(byBarcode.some((r) => r.product.barcode === "8908003630052")).toBe(true);
  });

  it("persists a new product and round-trips its nutrition", async () => {
    const lookup: ProductLookupResult = {
      product: {
        id: "",
        barcode: "1234567890123",
        name: "Test Curry Masala",
        brand: "Test Foods",
        category: "food",
        country: "IN",
        servingSize: "100 g",
        imageUrl: null,
        ingredientsRaw: "Salt, Spices, Turmeric",
        ingredientsNormalized: [],
        source: "test-provider",
        sourceUrl: "https://example.com/1234567890123",
        verified: false,
        productDataConfidence: 0.8,
        isDemo: false,
      },
      nutrition: {
        basis: "PER_100G",
        servingSize: "100 g",
        servingsPerContainer: undefined,
        nutrients: {
          calories: { value: 250, unit: "kcal", confidence: 0.8 },
          protein: { value: 8, unit: "g", confidence: 0.8 },
          sodium: { value: 500, unit: "mg", confidence: 0.8 },
        },
      },
      source: "test-provider",
    };

    const saved = await store.saveProductFromProvider(lookup);
    if (!saved.product) throw new Error("expected saved product");
    expect(saved.product.id).toMatch(/^FG_/);
    expect(saved.product.barcode).toBe("1234567890123");

    const found = await store.getProductByBarcode("1234567890123");
    expect(found).not.toBeNull();
    expect(found?.name).toBe("Test Curry Masala");
    expect(found?.ingredientsRaw).toContain("Turmeric");

    const nutrition = await store.getNutritionForProduct(saved.product.id);
    expect(nutrition?.nutrients.calories?.value).toBe(250);
    expect(nutrition?.nutrients.sodium?.value).toBe(500);
    expect(nutrition?.nutrients.sodium?.unit).toBe("mg");

    const foundById = await store.getProductById(saved.product.id);
    expect(foundById?.barcode).toBe("1234567890123");
  });

  it("does not duplicate a product that already exists", async () => {
    const saved = await store.saveProductFromProvider({
      product: {
        id: "",
        barcode: "8908003630052",
        name: "Duplicate AJAY Toothbrush",
        brand: null,
        category: "food",
        country: "IN",
        servingSize: null,
        imageUrl: null,
        ingredientsRaw: "",
        ingredientsNormalized: [],
        source: "test",
        sourceUrl: null,
        verified: false,
        productDataConfidence: 0.5,
        isDemo: false,
      },
      nutrition: null,
      source: "test",
    });
    if (!saved.product) throw new Error("expected saved product");
    expect(saved.product.id).toBe("FG_DBF242"); // existing product returned, not duplicated
  });

  // ── Catalog browsing (real DB rows, server-side paging) ─────
  it("lists the first catalog page with real rows and counts", async () => {
    const result = await store.listCatalog({ limit: 12 });
    expect(result.products.length).toBe(12);
    expect(result.total).toBeGreaterThan(10000);
    expect(result.dbTotal).toBe(result.total);
    expect(result.categories.length).toBeGreaterThan(0);
    for (const p of result.products) {
      expect(p.id).toMatch(/^FG_/);
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.hasBarcode).toBe(p.barcode.trim().length > 0);
    }
  });

  it("applies search, category, and pagination filters server-side", async () => {
    const page1 = await store.listCatalog({ search: "amul", category: "dairy", limit: 5 });
    expect(page1.total).toBeGreaterThan(0);
    expect(page1.products.length).toBeGreaterThan(0);
    for (const p of page1.products) {
      expect(p.category).toBe("dairy");
      expect(p.name.toLowerCase().includes("amul") || p.brand?.toLowerCase().includes("amul")).toBe(true);
    }

    const page2 = await store.listCatalog({ search: "amul", category: "dairy", limit: 5, offset: 5 });
    expect(page2.products.length).toBeGreaterThan(0);
    const names = new Set([...page1.products, ...page2.products].map((p) => p.id));
    expect(names.size).toBe(page1.products.length + page2.products.length); // no overlap
  });

  it("sorts by name and rating", async () => {
    const byName = await store.listCatalog({ category: "biscuits", sort: "name_asc", limit: 20 });
    const names = byName.products.map((p) => p.name.toLowerCase());
    const sorted = [...names].sort();
    expect(names).toEqual(sorted);

    const byRating = await store.listCatalog({ sort: "rating", limit: 20 });
    const ratings = byRating.products.map((p) => p.confidence);
    const sortedRatings = [...ratings].sort((a, b) => b - a);
    expect(ratings).toEqual(sortedRatings);
  });

  it("reports database health with real numbers", async () => {
    const health = await store.dbHealth();
    expect(health.totalProducts).toBeGreaterThan(10000);
    expect(health.missingName).toBe(0);
    expect(health.missingBarcode + health.invalidBarcode).toBeLessThan(health.totalProducts);
    expect(typeof health.duplicateBarcodes).toBe("number");
    expect(typeof health.missingNutrition).toBe("number");
    expect(typeof health.missingIngredients).toBe("number");
    expect(health.verifiedProducts).toBeGreaterThanOrEqual(0);
  });
});