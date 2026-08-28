import { AuthGuard } from "@/components/AuthGuard";
import { FoodSafetyAssistant } from "@/components/food-safety-assistant/FoodSafetyAssistant";
import { parseProductContextFromParams } from "@/components/food-safety-assistant/state";
import { config } from "@/lib/config";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function single(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function FoodSafetyAssistantPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const normalised: Record<string, string | undefined> = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, single(v)]),
  );
  const product = parseProductContextFromParams(normalised);
  return (
    <AuthGuard>
      <FoodSafetyAssistant product={product} backHref="/scan" informationalUrl={config.fssai.informationalUrl} />
    </AuthGuard>
  );
}
