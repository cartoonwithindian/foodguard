/**
 * Phase 6 — End-to-End Food Product Validation
 *
 * Tests the complete FoodGaurd pipeline for representative Indian
 * packaged-food categories using curated demo product data.
 *
 * Categories tested:
 * 1. Snack/namkeen (Crunchy Masala Snack)
 * 2. Namkeen (Namkeen Bhujia)
 * 3. Instant noodles (Masala Instant Noodles)
 * 4. Biscuit (Glucose Biscuits)
 * 5. Soft drink (Cola Soft Drink)
 * 6. Chocolate (Milk Chocolate Bar)
 * 7. Energy/health drink (Volt Energy Drink)
 * 8. Condiment (Tomato Ketchup)
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { runAnalysis } from "@/services/analysis.service";
import { FOOD_PRODUCT_SEED } from "@/data/seed/products-food";
import { getFSSAIAdditiveKnowledgeBase } from "@/services/regulatory/fssai/additive-knowledge-base";

// Force mock mode for AI to prevent real API calls during tests
const { savedAIEnv } = vi.hoisted(() => {
  const savedAIEnv = {
    AI_PROVIDER: process.env.AI_PROVIDER,
    AI_API_KEY: process.env.AI_API_KEY,
  };
  process.env.AI_PROVIDER = "mock";
  process.env.AI_API_KEY = "";
  return { savedAIEnv };
});

// ── Product fixtures (one per required category) ─────────────

const TEST_PRODUCTS = [
  {
    category: "Snack/namkeen",
    barcode: "8901000000001", // Crunchy Masala Snack
    expectedAdditives: ["621", "102", "110", "319"],
    keyIngredients: ["Monosodium Glutamate", "Tartrazine", "Sunset Yellow", "TBHQ"],
  },
  {
    category: "Namkeen",
    barcode: "8901000000002", // Namkeen Bhujia
    expectedAdditives: ["500"],
    keyIngredients: ["Chickpea Flour", "Acidity Regulator"],
  },
  {
    category: "Instant noodles",
    barcode: "8901000000003", // Masala Instant Noodles
    expectedAdditives: ["621", "223", "202", "322", "551"],
    keyIngredients: ["Monosodium Glutamate", "Sodium Metabisulfite", "Soy Lecithin"],
  },
  {
    category: "Biscuit",
    barcode: "8901000000004", // Glucose Biscuits
    expectedAdditives: ["500", "322", "320"],
    keyIngredients: ["Soy Lecithin", "Leavening Agents", "Antioxidant"],
  },
  {
    category: "Soft drink",
    barcode: "8901000000005", // Cola Soft Drink
    expectedAdditives: ["150d", "338"],
    keyIngredients: ["Caramel Colour", "Phosphoric Acid", "Caffeine"],
  },
  {
    category: "Chocolate",
    barcode: "8901000000007", // Milk Chocolate Bar
    expectedAdditives: ["322"],
    keyIngredients: ["Soy Lecithin", "Cocoa Butter", "Milk Solids"],
  },
  {
    category: "Energy drink",
    barcode: "8901000000010", // Volt Energy Drink
    expectedAdditives: ["330", "211", "150d"],
    keyIngredients: ["Caffeine", "Taurine", "Sodium Benzoate"],
  },
  {
    category: "Condiment",
    barcode: "8901000000012", // Tomato Ketchup
    expectedAdditives: ["202", "211"],
    keyIngredients: ["Potassium Sorbate", "Sodium Benzoate"],
  },
];

// ── Shared KB reference ─────────────────────────────────────

let additiveKB: ReturnType<typeof getFSSAIAdditiveKnowledgeBase>;

beforeAll(() => {
  additiveKB = getFSSAIAdditiveKnowledgeBase();
});

afterAll(() => {
  process.env.AI_PROVIDER = savedAIEnv.AI_PROVIDER ?? "mock";
  process.env.AI_API_KEY = savedAIEnv.AI_API_KEY ?? "";
});

// ── Tests ───────────────────────────────────────────────────

describe("E2E Food Product Validation (Phase 6)", () => {
  for (const product of TEST_PRODUCTS) {
    describe(`${product.category} (${product.barcode})`, () => {
      let result: Awaited<ReturnType<typeof runAnalysis>>;

      beforeAll(async () => {
        const seed = FOOD_PRODUCT_SEED.find((p) => p.barcode === product.barcode);
        expect(seed).toBeDefined();

        result = await runAnalysis({
          barcode: product.barcode,
          ingredientsText: seed!.ingredientsRaw,
          language: "en",
          skipAlternatives: true,
          skipPersonalization: true,
        });
      });

      // ── 1. Pipeline completeness ──────────────────────────

      it("returns a frontend result with name and score", () => {
        expect(result.frontend.name).toBeTruthy();
        expect(result.frontend.score).toBeGreaterThanOrEqual(0);
        expect(result.frontend.score).toBeLessThanOrEqual(100);
        expect(result.frontend.assessment).toMatch(/^(low|moderate|high|insufficient)$/);
      });

      it("has ingredient analysis", () => {
        expect(result.frontend.ingredients.length).toBeGreaterThan(0);
      });

      it("has positive or attention points", () => {
        const totalPoints =
          result.frontend.positivePoints.length + result.frontend.attentionPoints.length;
        expect(totalPoints).toBeGreaterThan(0);
      });

      // ── 2. FSSAI regulatory analysis ─────────────────────

      it("includes FSSAI regulatory analysis", () => {
        expect(result.frontend.regulatory).toBeDefined();
        expect(result.frontend.regulatory).not.toBeNull();
      });

      it("has an overall regulatory status", () => {
        const reg = result.frontend.regulatory!;
        expect(reg.overallStatus).toBeTruthy();
        expect(typeof reg.overallStatus).toBe("string");
      });

      it("has additive analysis results", () => {
        const reg = result.frontend.regulatory!;
        expect(Array.isArray(reg.additives)).toBe(true);
        // Most food products should have at least some additives detected
        if (reg.additives.length > 0) {
          expect(reg.additives[0].additiveName).toBeTruthy();
          expect(reg.additives[0].status).toBeTruthy();
        }
      });

      it("has labelling checks", () => {
        const reg = result.frontend.regulatory!;
        expect(reg.labelling).toBeDefined();
        expect(reg.labelling.checks).toBeDefined();
        expect(Array.isArray(reg.labelling.checks)).toBe(true);
      });

      it("has source traceability on additive results", () => {
        const reg = result.frontend.regulatory!;
        const additiveWithSource = reg.additives.find(
          (a) => a.source || (a.sourceReferences && a.sourceReferences.length > 0),
        );
        // At least one additive should have source info when matched from KB
        if (reg.additives.length > 0) {
          // Source may or may not be present depending on match type
          expect(typeof additiveWithSource !== "undefined" || reg.additives.length === 0).toBe(true);
        }
      });

      it("uses consumer-safe regulatory language (no 'compliant' claims)", () => {
        const reg = result.frontend.regulatory!;
        const disclaimer = reg.disclaimer ?? "";
        expect(disclaimer.toLowerCase()).not.toContain("legally compliant");
        expect(disclaimer.toLowerCase()).not.toContain("safe to consume");
      });

      // ── 3. Additive INS number matching ──────────────────

      it(`matches expected INS numbers from the additive KB`, () => {
        const reg = result.frontend.regulatory!;
        const matchedINS = reg.additives
          .map((a) => a.insNumber)
          .filter(Boolean)
          .map((ins) => ins!.replace(/^INS\s*/i, "").trim());

        // Check that at least some expected INS numbers are found
        const foundCount = product.expectedAdditives.filter((expected) =>
          matchedINS.some((m) => m === expected || m.includes(expected)),
        ).length;

        // At least 50% of expected additives should be matched
        expect(foundCount).toBeGreaterThanOrEqual(
          Math.ceil(product.expectedAdditives.length * 0.5),
        );
      });

      it("additive status values are valid", () => {
        const reg = result.frontend.regulatory!;
        const validStatuses = [
          "PERMITTED",
          "PERMITTED_WITH_CONDITIONS",
          "RESTRICTED",
          "NOT_PERMITTED",
          "NOT_SPECIFIED",
          "UNCLEAR",
          "UNKNOWN",
        ];
        for (const additive of reg.additives) {
          expect(validStatuses).toContain(additive.status);
        }
      });

      // ── 4. Contaminant semantics ─────────────────────────

      it("contaminant results use reference-limit wording, not contamination claims", () => {
        const reg = result.frontend.regulatory!;
        if (reg.contaminants && reg.contaminants.length > 0) {
          for (const cont of reg.contaminants) {
            // Should never claim contamination
            expect(cont.evidenceStatus).not.toBe("PRODUCT_TEST_RESULT_AVAILABLE");
            // Reference limits are fine
            if (cont.evidenceStatus) {
              expect(["REFERENCE_LIMIT_AVAILABLE", "NO_DATA", "UNKNOWN"]).toContain(
                cont.evidenceStatus,
              );
            }
          }
        }
      });

      // ── 5. Nutrition data ────────────────────────────────

      it("has nutrition data", () => {
        expect(result.frontend.nutrition).toBeDefined();
        expect(result.frontend.nutrition!.calories).toBeGreaterThan(0);
      });

      // ── 6. Meta information ──────────────────────────────

      it("meta has confidence and warnings", () => {
        expect(result.meta.confidence).toBeGreaterThanOrEqual(0);
        expect(result.meta.confidence).toBeLessThanOrEqual(1);
        expect(Array.isArray(result.meta.warnings)).toBe(true);
      });

      it("does not claim the product is healthy or safe", () => {
        const desc = result.frontend.assessmentDescription.toLowerCase();
        expect(desc).not.toContain("this product is safe");
        expect(desc).not.toContain("this product is healthy");
        expect(desc).not.toContain("legally compliant");
      });
    });
  }
});

// ── Standalone validation tests ─────────────────────────────

describe("Additive KB standalone validation", () => {
  it("KB has 500+ additives loaded", () => {
    const stats = additiveKB.getStats();
    expect(stats.totalRecords).toBeGreaterThanOrEqual(500);
  });

  it("can look up INS 621 (Monosodium Glutamate)", () => {
    const result = additiveKB.lookupByINS("621");
    expect(result).not.toBeNull();
    expect(result!.insNumber).toBe("621");
    expect(result!.name.toLowerCase()).toContain("monosodium glutamate");
  });

  it("can look up INS 322 (Lecithins)", () => {
    const result = additiveKB.lookupByINS("322");
    expect(result).not.toBeNull();
    expect(result!.insNumber).toBe("322");
  });

  it("can look up INS 211 (Sodium Benzoate)", () => {
    const result = additiveKB.lookupByINS("211");
    expect(result).not.toBeNull();
    expect(result!.insNumber).toBe("211");
  });

  it("can look up by name", () => {
    const result = additiveKB.lookupByName("Citric Acid");
    expect(result).not.toBeNull();
  });

  it("returns null for unknown INS number", () => {
    const result = additiveKB.lookupByINS("99999");
    expect(result).toBeNull();
  });
});

describe("Empty / failure cases", () => {
  it("handles unknown barcode gracefully", async () => {
    const result = await runAnalysis({
      barcode: "0000000000000",
      ingredientsText: "",
      language: "en",
      skipAlternatives: true,
      skipPersonalization: true,
    });
    // Should still return a result, not crash
    expect(result.frontend).toBeDefined();
    expect(result.meta.warnings.length).toBeGreaterThan(0);
  });

  it("handles empty ingredients gracefully", async () => {
    const result = await runAnalysis({
      barcode: "",
      ingredientsText: "",
      language: "en",
      skipAlternatives: true,
      skipPersonalization: true,
    });
    expect(result.frontend).toBeDefined();
    expect(result.frontend.ingredients.length).toBe(0);
  });

  it("handles ingredients-only input (no barcode)", async () => {
    const result = await runAnalysis({
      ingredientsText:
        "Sugar, Palm Oil, Corn Flour, Salt, Monosodium Glutamate (INS 621), Tartrazine (E102)",
      language: "en",
      skipAlternatives: true,
      skipPersonalization: true,
    });
    expect(result.frontend).toBeDefined();
    expect(result.frontend.ingredients.length).toBeGreaterThan(0);
    // FSSAI analysis should still run
    expect(result.frontend.regulatory).toBeDefined();
  });
});
