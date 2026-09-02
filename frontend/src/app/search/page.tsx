import { AuthGuard } from "@/components/AuthGuard";
import { SearchPage } from "@/components/search/SearchPage";

export default function SearchRoute() {
  return (
    <AuthGuard>
      <SearchPage />
    </AuthGuard>
  );
}
