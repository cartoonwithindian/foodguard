import { AuthGuard } from "@/components/AuthGuard";
import { ChatPage } from "@/components/chat/ChatPage";

type PageProps = {
  searchParams: Promise<{
    product_id?: string;
    product_name?: string;
    brand?: string;
    barcode?: string;
    conversation_id?: string;
    lang?: string;
  }>;
};

export default async function AssistantRoute({ searchParams }: PageProps) {
  const { product_id, product_name, brand, barcode, conversation_id, lang } = await searchParams;
  return (
    <AuthGuard>
      <ChatPage
        productId={product_id ?? null}
        productName={product_name ?? null}
        brand={brand ?? null}
        barcode={barcode ?? null}
        initialConversationId={conversation_id ?? null}
        lang={lang ?? null}
      />
    </AuthGuard>
  );
}