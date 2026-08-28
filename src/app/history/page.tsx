import { AuthGuard } from "@/components/AuthGuard";
import { HistoryPage } from "@/components/history/HistoryPage";

type PageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function HistoryRoute({ searchParams }: PageProps) {
  const { lang } = await searchParams;
  return (
    <AuthGuard>
      <HistoryPage lang={lang} />
    </AuthGuard>
  );
}
