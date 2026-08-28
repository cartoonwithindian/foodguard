"use client";

import { useState, useEffect } from "react";
import { ImageSelector } from "./ImageSelector";
import { Loader2 } from "lucide-react";

type Product = {
  id: string;
  barcode: string;
  name: string;
  brand: string | null;
  category: string;
  imageUrl: string | null;
};

export function ImageSelectorPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Use the catalog API which returns products with imageUrl
        // Fetch a large batch (up to 500 by paginating)
        const allProducts: Product[] = [];
        let page = 1;
        const limit = 50;
        let hasMore = true;

        while (hasMore && allProducts.length < 500) {
          const res = await fetch(
            `/api/products?page=${page}&limit=${limit}&sort=new`,
          );
          const json = await res.json();
          if (json.success && json.data?.products) {
            for (const p of json.data.products) {
              allProducts.push({
                id: p.id,
                barcode: p.barcode,
                name: p.name,
                brand: p.brand,
                category: p.category,
                imageUrl: p.imageUrl ?? null,
              });
            }
            hasMore = json.data.hasMore ?? false;
            page++;
          } else {
            break;
          }
        }
        setProducts(allProducts);
      } catch {
        setError("Failed to connect to the server");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin" />
          <p className="text-sm">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
          <p className="text-sm font-medium text-destructive">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-xs text-muted-foreground underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <a
              href="/admin"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              ← Admin
            </a>
            <span className="text-border">/</span>
            <h1 className="text-sm font-semibold text-card-foreground">
              🖼️ Image Selector
            </h1>
          </div>
          <span className="text-xs text-muted-foreground">
            {products.length} products loaded
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <ImageSelector products={products} />
      </main>
    </div>
  );
}
