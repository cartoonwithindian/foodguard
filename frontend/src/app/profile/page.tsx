import { AuthGuard } from "@/components/AuthGuard";
import { ProfilePage } from "@/components/profile/ProfilePage";

type PageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function ProfileRoute({ searchParams }: PageProps) {
  const { lang } = await searchParams;
  return (
    <AuthGuard>
      <ProfilePage lang={lang} />
    </AuthGuard>
  );
}
