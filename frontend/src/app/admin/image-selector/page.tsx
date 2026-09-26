import { AuthGuard } from "@/components/AuthGuard";
import { ImageSelectorPage } from "@/components/admin/ImageSelectorPage";

export const metadata = {
  title: "Image Selector — Admin",
  description: "Manually select product thumbnail images",
};

export default function AdminImageSelectorRoute() {
  return (
    <AuthGuard>
      <ImageSelectorPage />
    </AuthGuard>
  );
}
