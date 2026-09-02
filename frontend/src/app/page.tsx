import { HomeDashboard } from "@/components/dashboard/HomeDashboard";
import { AuthGuard } from "@/components/AuthGuard";

export default function HomePage() {
  return (
    <AuthGuard>
      <HomeDashboard />
    </AuthGuard>
  );
}
