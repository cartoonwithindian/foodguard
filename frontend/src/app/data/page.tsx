import { AuthGuard } from "@/components/AuthGuard";
import { ExternalDataPage } from "@/components/external/ExternalDataPage";

export default function DataRoute() {
  return (
    <AuthGuard>
      <ExternalDataPage />
    </AuthGuard>
  );
}
