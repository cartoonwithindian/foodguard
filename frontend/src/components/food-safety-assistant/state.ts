import type { ConversationState, IssueType, ProductSnapshot } from "@/types/food-safety-assistant";

export function initialConversationState(product: ProductSnapshot | null, language: "en" | "hi"): ConversationState {
  return {
    stage: "greeting",
    productSnapshot: product,
    issueType: null,
    issueConfidence: "low",
    collected: {},
    evidence: [],
    followUpsAsked: [],
    skipAnswers: [],
    currentQuestion: null,
    questionHistory: [],
    draft: null,
    language,
    assistantMessages: [],
  };
}

// URL encode/decode for product context. Used by both /scan, /analysis and
// the dedicated /food-safety-assistant route so the assistant can be
// opened with the user's current product context preserved.

export type SerializedProductContext = {
  barcode?: string | null;
  name?: string | null;
  brand?: string | null;
  category?: string | null;
  ingredients?: string[];
  allergens?: string[];
  nutritionConcerns?: string[];
  regulatorySummary?: string | null;
};

export function serializeProductContextToParams(p: ProductSnapshot | null): URLSearchParams {
  const params = new URLSearchParams();
  if (!p) return params;
  if (p.barcode) params.set("barcode", p.barcode);
  if (p.name) params.set("name", p.name);
  if (p.brand) params.set("brand", p.brand);
  if (p.category) params.set("category", p.category);
  if (p.ingredients && p.ingredients.length > 0) {
    params.set("ingredients", p.ingredients.slice(0, 60).join("|"));
  }
  if (p.allergens && p.allergens.length > 0) {
    params.set("allergens", p.allergens.slice(0, 20).join("|"));
  }
  if (p.nutritionConcerns && p.nutritionConcerns.length > 0) {
    params.set("nutritionConcerns", p.nutritionConcerns.slice(0, 10).join("|"));
  }
  if (p.regulatorySummary) {
    params.set("regulatorySummary", p.regulatorySummary.slice(0, 200));
  }
  return params;
}

export function parseProductContextFromParams(params: URLSearchParams | Record<string, string | undefined>): ProductSnapshot | null {
  const get = (k: string): string | undefined => {
    if (params instanceof URLSearchParams) return params.get(k) ?? undefined;
    return params[k];
  };
  const joinList = (raw: string | undefined): string[] => {
    if (!raw) return [];
    return raw
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 60);
  };
  const barcode = get("barcode") ?? null;
  const name = get("name") ?? null;
  const brand = get("brand") ?? null;
  const category = get("category") ?? null;
  const regulatorySummary = get("regulatorySummary") ?? null;
  const ingredients = joinList(get("ingredients"));
  const allergens = joinList(get("allergens"));
  const nutritionConcerns = joinList(get("nutritionConcerns"));
  if (!barcode && !name && ingredients.length === 0) {
    return null;
  }
  return {
    barcode: barcode || null,
    name: name || null,
    brand: brand || null,
    category: category || null,
    ingredients: ingredients.length > 0 ? ingredients : undefined,
    allergens: allergens.length > 0 ? allergens : undefined,
    nutritionConcerns: nutritionConcerns.length > 0 ? nutritionConcerns : undefined,
    regulatorySummary: regulatorySummary || null,
  };
}

export const QUICK_ISSUE_OPTIONS: Array<{ value: IssueType; label: string; description: string }> = [
  { value: "allergen_undeclared", label: "Allergen / reaction", description: "Possible undeclared allergen or allergic reaction" },
  { value: "foreign_object", label: "Foreign object", description: "Found metal, plastic, hair, insect or other object" },
  { value: "spoilage", label: "Spoilage / off smell", description: "Product is rotten, mouldy, smells bad, or past expiry" },
  { value: "mislabeling", label: "Mislabeling", description: "Ingredients on label don't match the product" },
  { value: "contamination", label: "Contamination", description: "Possible chemical or microbial contamination" },
  { value: "packaging_damage", label: "Damaged packaging", description: "Seal broken, packet leaked, can swollen" },
  { value: "unauthorized_additive", label: "Additive concern", description: "Suspected unauthorized or excessive additive" },
  { value: "fssai_concern", label: "FSSAI / license", description: "FSSAI license, marking or compliance concern" },
  { value: "other", label: "Other", description: "Something else not covered above" },
];
