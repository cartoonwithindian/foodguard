import { AuthGuard } from "@/components/AuthGuard";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

type PageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function AdminRoute({ searchParams }: PageProps) {
  const { lang } = await searchParams;
  return (
    <AuthGuard>
      <AdminDashboard lang={lang} />
    </AuthGuard>
  );
}
